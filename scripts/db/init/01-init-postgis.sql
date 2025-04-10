-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;
CREATE EXTENSION IF NOT EXISTS postgis_tiger_geocoder;

-- Create schemas
CREATE SCHEMA IF NOT EXISTS provider;
CREATE SCHEMA IF NOT EXISTS user_profile;
CREATE SCHEMA IF NOT EXISTS appointment;
CREATE SCHEMA IF NOT EXISTS analytics;

-- Set search path
SET search_path TO provider, user_profile, appointment, analytics, public;

-- Create provider-related tables
CREATE TABLE IF NOT EXISTS provider.provider_type (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS provider.specialty (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS provider.language (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS provider.provider (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    provider_type_id INTEGER REFERENCES provider.provider_type(id),
    registration_number VARCHAR(100),
    registration_council VARCHAR(200),
    experience_years INTEGER,
    about TEXT,
    email VARCHAR(255),
    phone VARCHAR(20),
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    is_registered_user BOOLEAN DEFAULT false,
    verification_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(registration_number, registration_council)
);

CREATE TABLE IF NOT EXISTS provider.provider_specialty (
    provider_id INTEGER REFERENCES provider.provider(id),
    specialty_id INTEGER REFERENCES provider.specialty(id),
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (provider_id, specialty_id)
);

CREATE TABLE IF NOT EXISTS provider.provider_language (
    provider_id INTEGER REFERENCES provider.provider(id),
    language_id INTEGER REFERENCES provider.language(id),
    proficiency_level VARCHAR(20) CHECK (proficiency_level IN ('basic', 'intermediate', 'fluent', 'native')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (provider_id, language_id)
);

CREATE TABLE IF NOT EXISTS provider.location (
    id SERIAL PRIMARY KEY,
    provider_id INTEGER REFERENCES provider.provider(id),
    name VARCHAR(255) NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'India',
    geolocation GEOGRAPHY(POINT, 4326) NOT NULL, -- Use geography type for lat/long
    is_primary BOOLEAN DEFAULT false,
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for geospatial queries
CREATE INDEX idx_location_geolocation ON provider.location USING GIST(geolocation);

-- Create index for provider searching
CREATE INDEX idx_provider_name ON provider.provider USING gin(name gin_trgm_ops);

-- Create functions to update timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_provider_timestamp
BEFORE UPDATE ON provider.provider
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_location_timestamp
BEFORE UPDATE ON provider.location
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

-- Initial data for testing
INSERT INTO provider.provider_type (name, description) VALUES 
('Doctor', 'Medical practitioner'),
('Hospital', 'Medical facility with inpatient beds'),
('Clinic', 'Outpatient medical facility'),
('Diagnostic Center', 'Facility for medical tests and diagnostics');

INSERT INTO provider.specialty (name, description) VALUES 
('General Medicine', 'Primary healthcare for adults'),
('Pediatrics', 'Medical care for children'),
('Cardiology', 'Heart-related medical care'),
('Dermatology', 'Skin-related medical care'),
('Orthopedics', 'Bone and joint related medical care');

INSERT INTO provider.language (name, code) VALUES 
('English', 'en'),
('Hindi', 'hi'),
('Telugu', 'te'),
('Tamil', 'ta'),
('Kannada', 'kn'),
('Malayalam', 'ml'),
('Bengali', 'bn'),
('Gujarati', 'gu'),
('Marathi', 'mr'),
('Punjabi', 'pa');

-- Add pg_trgm extension for text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Sample provider data will be added through migration scripts