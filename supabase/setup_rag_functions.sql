-- ============================================
-- Configuration RAG pour XAMXAM
-- À exécuter dans Supabase SQL Editor
-- ============================================

-- 1. Activer Row Level Security sur KnowledgeChunk
-- ============================================
ALTER TABLE "KnowledgeChunk" ENABLE ROW LEVEL SECURITY;

-- 2. Créer une policy pour que chaque shop accède uniquement à ses chunks
-- ============================================
CREATE POLICY "Shops can only access their own knowledge chunks"
ON "KnowledgeChunk"
FOR ALL
TO authenticated
USING (
  "shopId" IN (
    SELECT id FROM "Shop" 
    WHERE "ownerId" = auth.uid()
  )
);

-- 3. Créer la fonction de recherche de similarité
-- ============================================
CREATE OR REPLACE FUNCTION match_knowledge_chunks (
  query_embedding vector(1536),
  shop_id_param uuid,
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  content text,
  source text,
  metadata jsonb,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    "KnowledgeChunk".id,
    "KnowledgeChunk".content,
    "KnowledgeChunk".source,
    "KnowledgeChunk".metadata,
    -- Calcul de similarité cosinus (1 - distance cosinus)
    1 - ("KnowledgeChunk".embedding <=> query_embedding) as similarity
  FROM "KnowledgeChunk"
  WHERE 
    "KnowledgeChunk"."shopId" = shop_id_param
    AND "KnowledgeChunk".embedding IS NOT NULL
    AND 1 - ("KnowledgeChunk".embedding <=> query_embedding) > match_threshold
  ORDER BY "KnowledgeChunk".embedding <=> query_embedding ASC
  LIMIT match_count;
$$;

-- 4. Créer l'index vectoriel HNSW (À exécuter APRÈS avoir inséré des données)
-- ============================================
-- IMPORTANT: Décommenter cette ligne UNIQUEMENT après avoir inséré des embeddings
-- CREATE INDEX IF NOT EXISTS knowledge_chunk_embedding_hnsw_idx 
-- ON "KnowledgeChunk" 
-- USING hnsw (embedding vector_cosine_ops)
-- WITH (m = 16, ef_construction = 64);

-- 5. Créer un index sur shopId pour améliorer les performances de filtrage
-- ============================================
CREATE INDEX IF NOT EXISTS knowledge_chunk_shop_id_idx 
ON "KnowledgeChunk" ("shopId");

-- 6. Créer un index sur source pour filtrer par fichier
-- ============================================
CREATE INDEX IF NOT EXISTS knowledge_chunk_source_idx 
ON "KnowledgeChunk" (source);

-- ============================================
-- Fonction utilitaire pour compter les chunks par shop
-- ============================================
CREATE OR REPLACE FUNCTION count_knowledge_chunks_by_shop(shop_id_param uuid)
RETURNS bigint
LANGUAGE sql STABLE
AS $$
  SELECT COUNT(*)
  FROM "KnowledgeChunk"
  WHERE "shopId" = shop_id_param;
$$;

-- ============================================
-- Fonction pour récupérer les statistiques d'un shop
-- ============================================
CREATE OR REPLACE FUNCTION get_shop_rag_stats(shop_id_param uuid)
RETURNS TABLE (
  total_chunks bigint,
  total_sources bigint,
  chunks_with_embeddings bigint,
  chunks_without_embeddings bigint
)
LANGUAGE sql STABLE
AS $$
  SELECT
    COUNT(*) as total_chunks,
    COUNT(DISTINCT source) as total_sources,
    COUNT(embedding) as chunks_with_embeddings,
    COUNT(*) - COUNT(embedding) as chunks_without_embeddings
  FROM "KnowledgeChunk"
  WHERE "shopId" = shop_id_param;
$$;

-- ============================================
-- NOTES D'UTILISATION
-- ============================================
-- 
-- 1. Exécuter ce script dans Supabase SQL Editor
-- 
-- 2. L'index HNSW est commenté car il nécessite des données existantes.
--    Décommentez-le après avoir inséré vos premiers embeddings.
--
-- 3. Pour tester la fonction de recherche depuis votre code:
--    
--    const { data } = await supabase.rpc('match_knowledge_chunks', {
--      query_embedding: [0.1, 0.2, ...], // votre vecteur de 1536 dimensions
--      shop_id_param: 'uuid-de-votre-shop',
--      match_threshold: 0.7,
--      match_count: 5
--    });
--
-- 4. Pour obtenir les statistiques d'un shop:
--    
--    const { data } = await supabase.rpc('get_shop_rag_stats', {
--      shop_id_param: 'uuid-de-votre-shop'
--    });
--
-- ============================================
