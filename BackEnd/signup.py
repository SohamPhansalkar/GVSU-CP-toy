from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from enum import Enum
import mysql.connector
from mysql.connector import Error

# Create an APIRouter instance for these endpoints
router = APIRouter()

# Define the allowed gender values based on your SQL Enum
class GenderEnum(str, Enum):
    male = "male"
    female = "female"
    other = "other"
    prefer_not = "prefer not to say"

# Define the expected structure of the incoming request body
class UserSignup(BaseModel):
    email: EmailStr
    password: str
    name: str
    age: int
    gender: GenderEnum

# MySQL Database configuration
# Update these values to match your local MySQL setup
DB_CONFIG = {
    "host": "localhost",
    "user": "root",        
    "password": "root", 
    "database": "CPToy"
}

def get_db_connection():
    """Helper function to create a database connection."""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

@router.post("/signup")
def signup_user(user: UserSignup):
    """Endpoint to register a new user into the database."""
    connection = get_db_connection()
    if not connection:
        raise HTTPException(status_code=500, detail="Database connection failed")

    try:
        cursor = connection.cursor(dictionary=True)
        
        # 1. Check if the email is already registered
        cursor.execute("SELECT email FROM user WHERE email = %s", (user.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Email is already registered")

        # 2. Insert the new user
        # Note: For a production app, you should hash the password (e.g., using passlib & bcrypt) 
        # before storing it in the database.
        insert_query = """
            INSERT INTO user (email, password, name, age, gender)
            VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(
            insert_query, 
            (user.email, user.password, user.name, user.age, user.gender.value)
        )
        
        # Commit the transaction to save changes
        connection.commit()
        
        return {
            "status": "success", 
            "message": "User registered successfully", 
            "email": user.email
        }
        
    except Error as e:
        connection.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        # Ensure the connection is always closed
        if connection.is_connected():
            cursor.close()
            connection.close()