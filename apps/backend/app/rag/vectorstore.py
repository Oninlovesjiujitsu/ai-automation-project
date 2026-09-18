import os
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import Chroma

DATA_DIR = os.path.join(os.path.dirname(__file__), "../../data")
DB_DIR = os.path.join(os.path.dirname(__file__), "../../chroma_db")

def init_vectorstore() -> Chroma:
    """Initializes and returns the Chroma vector database using Gemini embeddings."""
    embeddings = GoogleGenerativeAIEmbeddings(model="models/text-embedding-004")
    
    if os.path.exists(DB_DIR):
        return Chroma(persist_directory=DB_DIR, embedding_function=embeddings)
        
    docs = []
    if os.path.exists(DATA_DIR):
        for file in os.listdir(DATA_DIR):
            if file.endswith((".txt", ".md")):
                loader = TextLoader(os.path.join(DATA_DIR, file))
                docs.extend(loader.load())
                
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    splits = text_splitter.split_documents(docs)
    
    vectorstore = Chroma.from_documents(documents=splits, embedding=embeddings, persist_directory=DB_DIR)
    return vectorstore

def get_retriever():
    """Returns a retriever interface for the vectorstore."""
    vs = init_vectorstore()
    return vs.as_retriever(search_kwargs={"k": 3})
