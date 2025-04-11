package com.healthapp.mapservice.repository;

import com.healthapp.mapservice.model.ProviderLocation;
import org.locationtech.jts.geom.Polygon;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProviderLocationRepository extends JpaRepository<ProviderLocation, Long> {

    // Find providers within a specified geographic viewport
    @Query(value = 
            "SELECT l FROM ProviderLocation l " +
            "JOIN FETCH l.provider p " +
            "WHERE ST_Intersects(:viewport, l.geolocation) = true"
    )
    List<ProviderLocation> findAllInViewport(@Param("viewport") Polygon viewport);
    
    // Find providers within viewport with filtering and pagination
    @Query(value = 
            "SELECT l FROM ProviderLocation l " +
            "JOIN l.provider p " +
            "LEFT JOIN p.specialties s " +
            "LEFT JOIN p.languages lang " +
            "WHERE ST_Intersects(:viewport, l.geolocation) = true " +
            "AND (:searchTerm IS NULL OR " +
                "LOWER(p.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
                "LOWER(l.name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
            "AND (:specialtyId IS NULL OR s.id = :specialtyId) " +
            "AND (:providerTypeId IS NULL OR p.providerTypeId = :providerTypeId) " +
            "AND (:languageId IS NULL OR lang.id = :languageId) " +
            "AND (:verifiedOnly = false OR p.isVerified = true) " +
            "AND (:registeredOnly = false OR p.isRegisteredUser = true) " +
            "GROUP BY l.id, p.id"
    )
    Page<ProviderLocation> findAllInViewportWithFilters(
            @Param("viewport") Polygon viewport,
            @Param("searchTerm") String searchTerm,
            @Param("specialtyId") Integer specialtyId,
            @Param("providerTypeId") Integer providerTypeId,
            @Param("languageId") Integer languageId,
            @Param("verifiedOnly") boolean verifiedOnly,
            @Param("registeredOnly") boolean registeredOnly,
            Pageable pageable
    );
    
    // Count providers within viewport with filtering
    @Query(value = 
            "SELECT COUNT(DISTINCT l.id) FROM ProviderLocation l " +
            "JOIN l.provider p " +
            "LEFT JOIN p.specialties s " +
            "LEFT JOIN p.languages lang " +
            "WHERE ST_Intersects(:viewport, l.geolocation) = true " +
            "AND (:searchTerm IS NULL OR " +
                "LOWER(p.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
                "LOWER(l.name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
            "AND (:specialtyId IS NULL OR s.id = :specialtyId) " +
            "AND (:providerTypeId IS NULL OR p.providerTypeId = :providerTypeId) " +
            "AND (:languageId IS NULL OR lang.id = :languageId) " +
            "AND (:verifiedOnly = false OR p.isVerified = true) " +
            "AND (:registeredOnly = false OR p.isRegisteredUser = true)"
    )
    Long countInViewportWithFilters(
            @Param("viewport") Polygon viewport,
            @Param("searchTerm") String searchTerm,
            @Param("specialtyId") Integer specialtyId,
            @Param("providerTypeId") Integer providerTypeId,
            @Param("languageId") Integer languageId,
            @Param("verifiedOnly") boolean verifiedOnly,
            @Param("registeredOnly") boolean registeredOnly
    );
    
    // Native query to find providers within viewport with distance calculation
    @Query(value = 
            "SELECT l.id, " +
            "ST_Distance(l.geolocation::geography, ST_SetSRID(ST_MakePoint(:userLng, :userLat), 4326)::geography) / 1000 as distance_km " +
            "FROM provider.location l " +
            "JOIN provider.provider p ON l.provider_id = p.id " +
            "LEFT JOIN provider.provider_specialty ps ON p.id = ps.provider_id " +
            "LEFT JOIN provider.provider_language pl ON p.id = pl.provider_id " +
            "WHERE ST_Intersects(ST_MakeEnvelope(:westLng, :southLat, :eastLng, :northLat, 4326), l.geolocation) " +
            "AND (:searchTerm IS NULL OR " +
                "LOWER(p.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
                "LOWER(l.name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
            "AND (:specialtyId IS NULL OR ps.specialty_id = :specialtyId) " +
            "AND (:providerTypeId IS NULL OR p.provider_type_id = :providerTypeId) " +
            "AND (:languageId IS NULL OR pl.language_id = :languageId) " +
            "AND (:verifiedOnly = false OR p.is_verified = true) " +
            "AND (:registeredOnly = false OR p.is_registered_user = true) " +
            "GROUP BY l.id, distance_km " +
            "ORDER BY distance_km ASC " +
            "LIMIT :limit OFFSET :offset",
            nativeQuery = true
    )
    List<Object[]> findAllInViewportWithDistanceNative(
            @Param("westLng") double westLng,
            @Param("southLat") double southLat,
            @Param("eastLng") double eastLng,
            @Param("northLat") double northLat,
            @Param("userLng") double userLng,
            @Param("userLat") double userLat,
            @Param("searchTerm") String searchTerm,
            @Param("specialtyId") Integer specialtyId,
            @Param("providerTypeId") Integer providerTypeId,
            @Param("languageId") Integer languageId,
            @Param("verifiedOnly") boolean verifiedOnly,
            @Param("registeredOnly") boolean registeredOnly,
            @Param("limit") int limit,
            @Param("offset") int offset
    );
    
    // Count total providers in viewport without pagination
    @Query(value = 
            "SELECT COUNT(DISTINCT l.id) " +
            "FROM provider.location l " +
            "WHERE ST_Intersects(ST_MakeEnvelope(:westLng, :southLat, :eastLng, :northLat, 4326), l.geolocation)",
            nativeQuery = true
    )
    Long countProvidersInViewport(
            @Param("westLng") double westLng,
            @Param("southLat") double southLat,
            @Param("eastLng") double eastLng,
            @Param("northLat") double northLat
    );
}