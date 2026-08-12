import chromadb


client = chromadb.PersistentClient(
    path="chroma_db"
)


collection = client.get_or_create_collection(
    name="documents",
    embedding_function=None
)


# ==========================================================
# STORE EMBEDDING
# ==========================================================

def store_embedding(
    chunk_id: str,
    chunk_text: str,
    embedding,
    metadata: dict
):
    collection.add(
        ids=[chunk_id],
        documents=[chunk_text],
        embeddings=[embedding],
        metadatas=[metadata]
    )


# ==========================================================
# SEARCH SIMILAR CHUNKS
# ==========================================================

def search_similar_chunks(
    query_embedding,
    top_k=5,
    department_id=None
):

    print("========================================")
    print("CHROMA DIAGNOSTIC")
    print("Collection count:", collection.count())
    print("Department ID:", department_id)
    print("========================================")

    query_params = {
        "query_embeddings": [query_embedding],
        "n_results": top_k
    }

    if department_id is not None:

        query_params["where"] = {
            "department_id": {
                "$in": [
                    str(department_id),
                    "company-wide"
                ]
            }
        }

        print(
            "Chroma filter:",
            query_params["where"]
        )

    else:

        print(
            "No department filter - searching all documents"
        )

    results = collection.query(
        **query_params
    )

    print(
        "Retrieved IDs:",
        results.get("ids")
    )

    print(
        "Retrieved metadata:",
        results.get("metadatas")
    )

    print("========================================")

    return results


# ==========================================================
# DELETE DOCUMENT EMBEDDINGS
# ==========================================================

def delete_document_embeddings(
    document_id
):

    collection.delete(
        where={
            "document_id": str(document_id)
        }
    )


# ==========================================================
# CHROMA COUNT
# ==========================================================

def get_chroma_count():

    return collection.count()