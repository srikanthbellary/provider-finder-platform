import os
import json
import requests
import asyncio
import logging
import re
from typing import Dict, List, Optional, Callable
from dotenv import load_dotenv
import chainlit as cl
from transformers import AutoTokenizer, AutoModelForCausalLM
import time
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import timeout_decorator
from sentence_transformers import SentenceTransformer
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()
logger.debug("Environment variables loaded")

# API endpoints from OpenAPI spec
API_CONFIG = {
    "translate": {
        "url": "http://144.202.20.247:5000/translate",
        "method": "POST",
        "timeout": 120
    },
    "map_symptoms": {
        "url": "http://35.184.95.96:8080/v1/chat/completions",
        "method": "POST",
        "timeout": 60
    },
    "find_hospitals": {
        "url": "http://144.202.20.247:8082/api/hospitals/nearby",
        "method": "POST",
        "timeout": 120
    }
}
logger.debug(f"API configuration: {json.dumps(API_CONFIG, indent=2)}")

# Configure retry strategy
retry_strategy = Retry(
    total=2,
    backoff_factor=1.0,
    status_forcelist=[500, 502, 503, 504, 408, 429],
    allowed_methods=["GET", "POST"],
    raise_on_status=False
)
logger.debug("Retry strategy configured")

# Create a session with retry strategy
session = requests.Session()
adapter = HTTPAdapter(max_retries=retry_strategy, pool_connections=50, pool_maxsize=50, pool_block=True)
session.mount("http://", adapter)
session.mount("https://", adapter)
session.headers.update({
    'Connection': 'keep-alive',
    'Keep-Alive': 'timeout=1800, max=1000',
    'Accept': 'application/json',
    'Content-Type': 'application/json'
})
logger.debug("HTTP session configured")

# Initialize TinyLlama for reasoning
model_name = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
logger.debug(f"Loading tokenizer and model: {model_name}")
try:
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    tokenizer.pad_token = tokenizer.eos_token
    model = AutoModelForCausalLM.from_pretrained(model_name)
    logger.debug("Tokenizer and model loaded")
except Exception as e:
    logger.error(f"Failed to load model: {str(e)}")
    raise

# Keywords for fallbacks
SYMPTOM_KEYWORDS = [
    "infection", "pain", "ache", "swelling", "vision", "blur", "itch", "discharge",
    "redness", "fever", "cough", "shortness", "breath", "dizziness", "nausea"
]
HOSPITAL_KEYWORDS = ["hospital", "hospitals", "nearby", "near", "clinic", "doctor", "specialist"]
logger.debug(f"Symptom keywords: {SYMPTOM_KEYWORDS}")
logger.debug(f"Hospital keywords: {HOSPITAL_KEYWORDS}")

# Tool definitions
TOOLS = {
    "translate_text": {
        "description": "Translates text from one language to another.",
        "parameters": ["text", "source_lang", "target_lang"],
        "function": None
    },
    "map_symptoms": {
        "description": "Maps symptoms to a medical specialist.",
        "parameters": ["symptoms"],
        "function": None
    },
    "find_nearby_hospitals": {
        "description": "Finds nearby hospitals for a specific medical specialist.",
        "parameters": ["specialization"],
        "function": None
    },
    "health_guide": {
        "description": "Provides general health guidance for a query.",
        "parameters": ["query"],
        "function": None
    }
}
logger.debug(f"Tool definitions: {json.dumps(TOOLS, indent=2, default=str)}")

# Initialize sentence transformer for symptom mapping
try:
    symptom_model = SentenceTransformer('all-MiniLM-L6-v2')
    logger.debug("Loaded sentence transformer model")
except Exception as e:
    logger.error(f"Failed to load sentence transformer model: {str(e)}")
    raise

# Load symptom-specialist mappings from JSON file
def load_symptom_specialist_mappings():
    """Load symptom-specialist mappings from JSON file and create embeddings."""
    try:
        with open("symp_spec.json", "r", encoding="utf-8") as f:
            mappings = json.load(f)
        logger.debug(f"Loaded {len(mappings)} symptom-specialist mappings")
        
        # Create embeddings for all symptoms
        symptom_texts = [mapping["symptoms"] for mapping in mappings]
        symptom_embeddings = symptom_model.encode(symptom_texts)
        
        # Store mappings with their embeddings
        for i, mapping in enumerate(mappings):
            mapping["embedding"] = symptom_embeddings[i]
        
        logger.debug("Created embeddings for all symptom mappings")
        return mappings
    except FileNotFoundError:
        logger.error("symptom_specialist.json file not found")
        return []
    except json.JSONDecodeError:
        logger.error("Invalid JSON format in symptom_specialist.json")
        return []
    except Exception as e:
        logger.error(f"Error loading symptom-specialist mappings: {str(e)}")
        return []

# Load mappings at module level
SYMPTOM_SPECIALIST_MAPPINGS = load_symptom_specialist_mappings()

def map_symptoms_to_specialist(symptoms: str, similarity_threshold: float = 0.6) -> str:
    """Map symptoms to specialist using embedding similarity."""
    try:
        if not SYMPTOM_SPECIALIST_MAPPINGS:
            logger.warning("No symptom mappings available")
            return "General Physician"
        
        # Create embedding for input symptoms
        symptoms_embedding = symptom_model.encode([symptoms])[0]
        
        # Calculate similarities with all mappings
        similarities = []
        for mapping in SYMPTOM_SPECIALIST_MAPPINGS:
            similarity = cosine_similarity(
                [symptoms_embedding],
                [mapping["embedding"]]
            )[0][0]
            similarities.append((similarity, mapping["specialist"]))
        
        # Sort by similarity and get the best match
        similarities.sort(reverse=True)
        best_similarity, best_specialist = similarities[0]
        
        logger.debug(f"Best similarity score: {best_similarity:.3f} for specialist: {best_specialist}")
        
        # Return the specialist if similarity is above threshold
        if best_similarity >= similarity_threshold:
            return best_specialist
        return "General Physician"
        
    except Exception as e:
        logger.error(f"Error mapping symptoms to specialist: {str(e)}")
        return "General Physician"

class HealthChatbotAgent:
    def __init__(self):
        self.context = []
        self.last_reset = time.time()
        self.last_specialist = "General Physician"
        self.last_location = {"latitude": 17.4598259, "longitude": 78.3495731}
        self.max_context_length = 3
        TOOLS["translate_text"]["function"] = self.translate_text
        TOOLS["map_symptoms"]["function"] = self.map_symptoms
        TOOLS["find_nearby_hospitals"]["function"] = self.find_nearby_hospitals
        TOOLS["health_guide"]["function"] = self.health_guide
        logger.debug("Tools bound to functions")
        self.allowed_specialties = [
            "Acupuncturist", "Andrologist", "Anesthesiologist", "Audiologist", "Ayurveda", "Bariatric Surgeon",
            "Cardiac Surgeon", "Cardiologist", "Cardiothoracic Surgeon", "Cosmetologist", "Dentist", "Dermatologist",
            "Diabetologist", "Dietitian/Nutritionist", "ENT Specialist", "Emergency & Critical Care", "Endocrinologist",
            "Family Physician", "Gastroenterologist", "General Physician", "General Surgeon", "Gynecologist/Obstetrician",
            "Hematologist", "Homoeopath", "Infertility Specialist", "Internal Medicine", "Nephrologist", "Neurologist",
            "Neurosurgeon", "Oncologist", "Ophthalmologist", "Orthopedist", "Pediatrician", "Physiotherapist",
            "Plastic Surgeon", "Psychiatrist", "Pulmonologist", "Radiologist", "Rheumatologist", "Urologist", "Vascular Surgeon"
        ]

    def _should_reset_context(self) -> bool:
        current_time = time.time()
        if current_time - self.last_reset > 1800 or len(self.context) > self.max_context_length * 2:
            logger.debug("Context reset triggered: timeout or max length exceeded")
            self._reset_context()
            return True
        return False

    def _reset_context(self):
        self.context = []
        self.last_reset = time.time()
        logger.debug("Context reset")

    def _has_symptoms(self, user_input: str) -> bool:
        """Check if the input contains symptom-related keywords."""
        user_input_lower = user_input.lower()
        
        # First check for explicit problem indicators
        problem_indicators = [
            "problem", "problems", "suffering", "suffering from", "experiencing",
            "having", "have", "has", "got", "getting", "trouble", "difficulty", 
            "issue", "issues", "condition", "conditions", "symptom", "symptoms", 
            "diagnosis", "diagnosed", "pain", "ache", "hurting", "hurts", "feel",
            "feeling", "feels", "sick", "ill", "unwell", "not feeling well"
        ]
        
        # Check for actual symptoms
        symptom_keywords = [
            "pain", "ache", "rash", "fever", "cough", "headache", "dizziness",
            "nausea", "vomiting", "diarrhea", "constipation", "burning",
            "itching", "swelling", "redness", "infection", "disease", "illness",
            "heartburn", "reflux", "acid", "sleep", "trouble", "difficulty",
            "severe", "chronic", "acute", "persistent", "recurring", "constant"
        ]
        
        # Check if input contains any symptom keywords
        has_symptoms = any(keyword in user_input_lower for keyword in symptom_keywords)
        
        # Check if input contains any problem indicators
        has_problem_indicators = any(indicator in user_input_lower for indicator in problem_indicators)
        
        # Log the detection results
        logger.debug(f"Symptom detection - Has symptoms: {has_symptoms}, Has problem indicators: {has_problem_indicators}")
        
        return has_symptoms or has_problem_indicators

    def _has_hospital_query(self, user_input: str) -> bool:
        """Check if the input contains hospital-related keywords."""
        user_input_lower = user_input.lower()
        hospital_keywords = [
            "hospital", "hospitals", "nearby", "near", "clinic", "find",
            "search", "look", "show", "where", "location", "address"
        ]
        return any(keyword in user_input_lower for keyword in hospital_keywords)

    async def _make_api_request(self, api_key: str, payload: dict, timeout: int) -> Optional[dict]:
        logger.debug(f"Making API request to {api_key} with payload: {json.dumps(payload, indent=2)}")
        max_retries = 2
        retry_delay = 2

        api_config = API_CONFIG.get(api_key)
        if not api_config:
            logger.error(f"Invalid API key: {api_key}")
            return None

        for attempt in range(max_retries):
            try:
                headers = {
                    'X-Request-ID': f"req_{time.time()}_{attempt}",
                    'X-Retry-Attempt': str(attempt + 1)
                }
                logger.debug(f"API attempt {attempt + 1}/{max_retries} with headers: {headers}")
                response = session.request(
                    method=api_config["method"],
                    url=api_config["url"],
                    json=payload,
                    timeout=timeout,
                    headers=headers
                )
                logger.debug(f"API {api_key} response status: {response.status_code}")
                logger.debug(f"API {api_key} response content: {response.text[:500]}...")
                if response.status_code == 200:
                    return response.json()
                elif response.status_code in [408, 429, 500, 502, 503, 504]:
                    wait_time = retry_delay * (2 ** attempt)
                    logger.warning(f"API {api_key} error {response.status_code}. Waiting {wait_time}s...")
                    await asyncio.sleep(wait_time)
                    continue
                else:
                    logger.error(f"API {api_key} unexpected status: {response.status_code}")
                    return None

            except requests.exceptions.Timeout:
                logger.warning(f"API {api_key} timeout on attempt {attempt + 1}")
                if attempt < max_retries - 1:
                    await asyncio.sleep(retry_delay * (2 ** attempt))
                    continue
                return None
            except requests.exceptions.ConnectionError as e:
                logger.warning(f"API {api_key} connection error: {str(e)}")
                if attempt < max_retries - 1:
                    await asyncio.sleep(retry_delay * (2 ** attempt))
                    continue
                return None
            except Exception as e:
                logger.error(f"API {api_key} error: {str(e)}")
                return None

        logger.error(f"API {api_key} failed after {max_retries} retries")
        return None

    async def translate_text(self, text: str, source_lang: str = "en", target_lang: str = "te") -> str:
        logger.debug(f"Translating text: '{text}' from {source_lang} to {target_lang}")
        try:
            payload = {
                "text": text,
                "sourceLang": source_lang,
                "targetLang": target_lang,
                "cleanup": True
            }
            result = await self._make_api_request("translate", payload, API_CONFIG["translate"]["timeout"])
            if result and "translation" in result:
                translation = result["translation"]
                logger.debug(f"Translation successful: {translation}")
                return translation
            logger.error("Translation failed: no translation in response")
            return "Translation failed. Please try again."
        except Exception as e:
            logger.error(f"Translate error: {str(e)}")
            return f"Translation error: {str(e)}"

    async def _get_specialist_from_symptoms(self, raw_response: str, symptoms: str) -> str:
        logger.debug(f"Parsing specialist from raw response: {raw_response}")
        try:
            # Try to match any allowed specialty in the response
            specialist = raw_response
            for specialty in self.allowed_specialties:
                if specialty.lower() in raw_response.lower():
                    specialist = specialty
                    break
            else:
                # Try regex to extract a single word or phrase resembling a specialty
                match = re.search(r'\b(?:[A-Z][a-z]+(?:/[A-Z][a-z]+)?)\b', raw_response)
                if match and match.group(0) in self.allowed_specialties:
                    specialist = match.group(0)

            # Validate specialist
            if specialist not in self.allowed_specialties:
                logger.warning(f"Invalid specialist extracted: {specialist}. Falling back to General Physician.")
                specialist = "General Physician"

            logger.debug(f"Parsed specialist: {specialist}")
            self.last_specialist = specialist
            self.context.append({"user_input": symptoms, "tool": "map_symptoms", "specialist": specialist})
            logger.debug(f"Updated last_specialist: {self.last_specialist}, Context: {self.context[-1]}")
            return specialist
        except Exception as e:
            logger.error(f"Error parsing specialist: {str(e)}. Falling back to General Physician.")
            self.last_specialist = "General Physician"
            self.context.append({"user_input": symptoms, "tool": "map_symptoms", "specialist": "General Physician"})
            return "General Physician"

    async def map_symptoms(self, symptoms: str) -> str:
        logger.debug(f"Mapping symptoms: '{symptoms}'")
        try:
            symptoms = ' '.join(dict.fromkeys(symptoms.split()))
            
            # Try to map using embedding-based matching first
            specialist = map_symptoms_to_specialist(symptoms)
            if specialist != "General Physician":
                logger.debug(f"Mapped to specialist using embedding similarity: {specialist}")
                self.last_specialist = specialist
                self.context.append({
                    "user_input": symptoms,
                    "tool": "map_symptoms",
                    "specialist": specialist,
                    "timestamp": time.time()
                })
                return f"For your symptoms, consult a {specialist}. Please consult a healthcare professional."
            
            # If no good match found, try the API
            prompt = (
                "You are OpenBioLLM, a medical specialty mapping assistant developed by DA2 AI Labs with Open Life Science AI. "
                "Your sole purpose is to match patient-reported symptoms to ONE appropriate medical specialist type from the following EXACT list:\n\n"
                "[Acupuncturist, Andrologist, Anesthesiologist, Audiologist, Ayurveda, Bariatric Surgeon, Cardiac Surgeon, Cardiologist, Cardiothoracic Surgeon, "
                "Cosmetologist, Dentist, Dermatologist, Diabetologist, Dietitian/Nutritionist, ENT Specialist, Emergency & Critical Care, Endocrinologist, "
                "Family Physician, Gastroenterologist, General Physician, General Surgeon, Gynecologist/Obstetrician, Hematologist, Homoeopath, Infertility Specialist, "
                "Internal Medicine, Nephrologist, Neurologist, Neurosurgeon, Oncologist, Ophthalmologist, Orthopedist, Pediatrician, Physiotherapist, Plastic Surgeon, "
                "Psychiatrist, Pulmonologist, Radiologist, Rheumatologist, Urologist, Vascular Surgeon]\n\n"
                "Rules:\n"
                "1. STRICTLY respond with ONLY ONE specialty from the above list.\n"
                "2. NEVER add explanations, diagnoses, or additional text.\n"
                "3. Use 'General Physician' for:\n"
                "   - Non-specific symptoms\n"
                "   - Cases matching multiple specialties equally\n"
                "   - When no clear match exists.\n"
                "4. For pediatric cases (<18 years), prefer 'Pediatrician' when applicable.\n\n"
                f"Now respond ONLY with the specialty for: {symptoms}"
            )
            
            payload = {
                "model": "openbiollm-llama3-8b",
                "messages": [
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": symptoms}
                ],
                "temperature": 0.0,
                "max_tokens": 50
            }
            
            max_retries = 3
            for attempt in range(max_retries):
                try:
                    result = await self._make_api_request("map_symptoms", payload, API_CONFIG["map_symptoms"]["timeout"])
                    if result and "choices" in result and len(result["choices"]) > 0:
                        raw_response = result["choices"][0]["message"]["content"].strip()
                        logger.debug(f"Raw specialist response from API: {raw_response}")
                        specialist = await self._get_specialist_from_symptoms(raw_response, symptoms)
                        break
                except Exception as e:
                    logger.warning(f"API attempt {attempt + 1} failed: {str(e)}")
                    if attempt == max_retries - 1:
                        specialist = "General Physician"
                    await asyncio.sleep(1)  # Wait before retry
            
            # Update the last specialist and context
            self.last_specialist = specialist
            self.context.append({
                "user_input": symptoms,
                "tool": "map_symptoms",
                "specialist": specialist,
                "timestamp": time.time()
            })
            logger.debug(f"Updated last_specialist to: {specialist}")
            
            response = f"For your symptoms, consult a {specialist}. Please consult a healthcare professional."
            logger.debug(f"Mapped to specialist: {specialist}, GUI Response: {response}")
            return response
            
        except Exception as e:
            logger.error(f"Map symptoms error: {str(e)}")
            self.last_specialist = "General Physician"
            self.context.append({
                "user_input": symptoms,
                "tool": "map_symptoms",
                "specialist": "General Physician",
                "timestamp": time.time()
            })
            return "For your symptoms, consult a General Physician. Please consult a healthcare professional."

    async def find_nearby_hospitals(self, specialization: str = None) -> str:
        specialization = specialization or self.last_specialist
        logger.debug(f"Searching hospitals for specialist: {specialization}")
        try:
            # Check if we have a recent specialist mapping
            recent_specialist = None
            for entry in reversed(self.context):
                if entry.get("tool") == "map_symptoms" and time.time() - entry.get("timestamp", 0) < 300:  # 5 minutes
                    recent_specialist = entry.get("specialist")
                    break
            
            if recent_specialist:
                specialization = recent_specialist
                logger.debug(f"Using recent specialist mapping: {specialization}")
            
            payload = {
                "latitude": self.last_location["latitude"],
                "longitude": self.last_location["longitude"],
                "maxDistance": 5,
                "specialization": specialization
            }
            logger.debug(f"find_nearby_hospitals payload: {json.dumps(payload, indent=2)}")
            result = await self._make_api_request("find_hospitals", payload, API_CONFIG["find_hospitals"]["timeout"])
            if result:
                response = f"Nearest hospitals with {specialization} specialists:\n\n"
                for i, hospital in enumerate(result[:3], 1):
                    response += f"{i}. {hospital['name']}\n"
                    response += f"   📍 {hospital['address']}\n"
                    response += f"   📏 {hospital['distanceKm']:.1f} km away\n\n"
                self.context.append({
                    "user_input": "find hospitals",
                    "tool": "find_nearby_hospitals",
                    "specialist": specialization,
                    "timestamp": time.time()
                })
                logger.debug(f"Hospital search response: {response[:200]}...")
                return response
            logger.error(f"No hospitals found for {specialization}")
            return f"No hospitals found for {specialization}. Please try a different search."
        except Exception as e:
            logger.error(f"Find hospitals error: {str(e)}")
            return "Error finding hospitals. Please try again."

    async def health_guide(self, query: str) -> str:
        logger.debug(f"Providing health guidance for query: '{query}'")
        try:
            prompt = (
                "You are OpenBioLLM, a medical assistant specializing in providing detailed health guidance. "
                "For the given health query, provide comprehensive advice including:\n"
                "1. Specific lifestyle recommendations\n"
                "2. Dietary advice (what to eat/avoid)\n"
                "3. Preventive measures\n"
                "4. When to seek medical attention\n\n"
                "Format your response in clear, numbered points. "
                "Be specific, practical, and actionable. "
                "Include relevant medical context but avoid making diagnoses. "
                "Always end with 'Please consult a healthcare professional for personalized advice.'\n\n"
                f"Query: {query}"
            )
            
            payload = {
                "model": "openbiollm-llama3-8b",
                "messages": [
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": query[:200]}
                ],
                "temperature": 0.2,
                "max_tokens": 300  # Increased token limit for more detailed response
            }
            
            result = await self._make_api_request("map_symptoms", payload, API_CONFIG["map_symptoms"]["timeout"])
            if result and "choices" in result and len(result["choices"]) > 0:
                content = result["choices"][0]["message"]["content"].strip()
                logger.debug(f"Health guide response: {content}")
                return content
            logger.error("Health guide failed: no choices in response")
            return "I recommend consulting a healthcare professional for your symptoms."
        except Exception as e:
            logger.error(f"Health guide error: {str(e)}")
            return "Error providing health guidance. Please consult a healthcare professional."

    @timeout_decorator.timeout(30, timeout_exception=TimeoutError)
    def _generate_model_response(self, inputs):
        logger.debug("Starting model.generate")
        try:
            outputs = model.generate(
                inputs["input_ids"],
                attention_mask=inputs["attention_mask"],
                max_new_tokens=200,
                num_return_sequences=1,
                temperature=0.3,
                do_sample=True,
                pad_token_id=tokenizer.eos_token_id
            )
            logger.debug("Model.generate completed")
            return outputs
        except Exception as e:
            logger.error(f"Model generate error: {str(e)}")
            raise

    async def reason_and_act(self, user_input: str) -> Dict:
        logger.debug(f"Starting reason_and_act for input: '{user_input}'")
        try:
            user_input_lower = user_input.lower()
            
            # Check for specialist-related queries
            specialist_keywords = [
                "who", "which doctor", "which specialist", "what doctor", "what specialist",
                "treat", "treats", "treating", "treat this", "treat these",
                "help", "helps", "helping", "help with", "help for",
                "see", "consult", "visit", "go to", "recommend"
            ]
            
            # Check if this is a follow-up question about specialist
            is_specialist_query = any(keyword in user_input_lower for keyword in specialist_keywords)
            has_recent_symptoms = False
            recent_symptoms = None
            
            # Look for recent symptom context
            for entry in reversed(self.context):
                if entry.get("tool") == "map_symptoms":
                    has_recent_symptoms = True
                    recent_symptoms = entry.get("user_input")
                    break
            
            # If this is a specialist query and we have recent symptoms, use map_symptoms
            if is_specialist_query and has_recent_symptoms:
                logger.info("Detected specialist query with recent symptoms context, using map_symptoms")
                return {"tool": "map_symptoms", "parameters": {"symptoms": recent_symptoms}}
            
            # Check for symptom-related queries FIRST
            if self._has_symptoms(user_input):
                logger.info("Detected symptom-related query, using map_symptoms")
                return {"tool": "map_symptoms", "parameters": {"symptoms": user_input}}
            
            # Check for hospital-related queries
            if self._has_hospital_query(user_input):
                logger.info("Detected hospital-related query, using find_nearby_hospitals")
                return {"tool": "find_nearby_hospitals", "parameters": {"specialization": self.last_specialist}}
            
            # Check for explicit guidance requests
            guidance_keywords = [
                "guidance", "advice", "help", "tips", "suggestions", "recommendations",
                "how to", "what to do", "prevent", "avoid", "manage", "treat",
                "care", "lifestyle", "diet", "exercise", "sleep", "stress"
            ]
            
            # Check for explicit guidance request
            if any(keyword in user_input_lower for keyword in guidance_keywords):
                logger.info("Detected explicit health guidance query, using health_guide")
                return {"tool": "health_guide", "parameters": {"query": user_input}}
            
            # Default to health guidance for general health queries
            logger.info("Defaulting to health guidance for general health query")
            return {"tool": "health_guide", "parameters": {"query": user_input}}

        except Exception as e:
            logger.error(f"Reasoning error: {str(e)}")
            # Fallback to health guidance
            logger.info("Falling back to health guidance")
            return {"tool": "health_guide", "parameters": {"query": user_input}}

    async def process_query(self, user_input: str) -> str:
        logger.debug(f"Starting process_query for input: '{user_input}'")
        try:
            self._should_reset_context()

            decision = await self.reason_and_act(user_input)
            tool_name = decision.get("tool", "health_guide")
            parameters = decision.get("parameters", {})
            logger.debug(f"Tool selected: {tool_name} with parameters: {parameters}")

            if tool_name not in TOOLS:
                logger.warning(f"Invalid tool selected: {tool_name}")
                tool_name = "health_guide"
                parameters = {"query": user_input}

            tool_info = TOOLS[tool_name]
            tool_func = tool_info["function"]

            logger.info(f"Executing tool: {tool_name} with parameters: {parameters}")
            response = await tool_func(**parameters)
            if not response:
                logger.error(f"Empty response from tool: {tool_name}")
                response = "Sorry, no response was generated. Please try again."
            logger.debug(f"Tool response: {response[:200]}...")

            self.context.append({"user_input": user_input, "tool": tool_name, "parameters": parameters})
            logger.debug(f"Context updated: {self.context[-1]}")

            logger.debug(f"Sending response to Chainlit: {response[:200]}...")
            try:
                message = cl.Message(content=response)
                await asyncio.wait_for(message.send(), timeout=10)
                logger.info("Response sent to Chainlit GUI")
            except asyncio.TimeoutError:
                logger.error("Timeout sending response to Chainlit GUI")
                response = "Sorry, failed to display response. Please try again."
                await cl.Message(content=response).send()
                logger.info("Error response sent to Chainlit GUI")

            logger.debug("Completed process_query")
            return response

        except Exception as e:
            logger.error(f"Process query error: {str(e)}")
            error_response = "Sorry, an error occurred. Please try again."
            logger.debug(f"Sending error response to Chainlit: {error_response}")
            try:
                await asyncio.wait_for(cl.Message(content=error_response).send(), timeout=10)
                logger.info("Error response sent to Chainlit GUI")
            except asyncio.TimeoutError:
                logger.error("Timeout sending error response to Chainlit GUI")
            return error_response

@cl.on_chat_start
async def start():
    try:
        logger.info("Starting chat session")
        cl.user_session.set("chatbot", HealthChatbotAgent())
        welcome_message = "Hello! I'm your health assistant. How can I help you today?"
        logger.debug(f"Sending welcome message to Chainlit: {welcome_message}")
        await asyncio.wait_for(cl.Message(content=welcome_message).send(), timeout=10)
        logger.info("Welcome message sent to Chainlit GUI")
    except Exception as e:
        logger.error(f"Chat start error: {str(e)}")
        error_message = "Sorry, there was an error starting the chat. Please try again."
        logger.debug(f"Sending error message to Chainlit: {error_message}")
        await asyncio.wait_for(cl.Message(content=error_message).send(), timeout=10)
        logger.info("Error message sent to Chainlit GUI")

@cl.on_message
async def main(message: cl.Message):
    try:
        logger.info(f"Received message: '{message.content}'")
        chatbot = cl.user_session.get("chatbot")
        if not chatbot:
            logger.info("Creating new chatbot instance")
            chatbot = HealthChatbotAgent()
            cl.user_session.set("chatbot", chatbot)

        response = await chatbot.process_query(message.content)
        logger.debug(f"Final response: {response[:200]}...")

    except Exception as e:
        logger.error(f"Main error: {str(e)}")
        error_response = "Sorry, an error occurred. Please try again."
        logger.debug(f"Sending error response to Chainlit: {error_response}")
        try:
            await asyncio.wait_for(cl.Message(content=error_response).send(), timeout=10)
            logger.info("Error response sent to Chainlit GUI")
        except asyncio.TimeoutError:
            logger.error("Timeout sending error response to Chainlit GUI")