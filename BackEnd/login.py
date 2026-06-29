from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
import mysql.connector
from mysql.connector import Error

router = APIRouter()

class UserLogin(BaseModel):
    email: EmailStr
    password: str


DB_CONFIG = {
    "host": "localhost",
    "user": "root",        
    "password": "root", 
    "database": "CPToy"
}

def get_db_connection():
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

@router.post("/login")
def login_user(user: UserLogin):
    """Endpoint to authenticate a user."""
    connection = get_db_connection()
    if not connection:
        raise HTTPException(status_code=500, detail="Database connection failed")

    try:
        cursor = connection.cursor(dictionary=True)
        
        query = "SELECT email, name, controller1, controller2 FROM user WHERE email = %s AND password = %s"
        cursor.execute(query, (user.email, user.password))
        
        db_user = cursor.fetchone()

        if not db_user:
            raise HTTPException(status_code=401, detail="Invalid email or password")

        return {
            "status": "success",
            "message": "Login successful",
            "user": {
                "email": db_user["email"],
                "name": db_user["name"],
                "controller1": db_user["controller1"],
                "controller2": db_user["controller2"]
            }
        }
        
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()