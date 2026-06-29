from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
import mysql.connector
from mysql.connector import Error

router = APIRouter()

# Expected data from frontend
class ControllerUpdate(BaseModel):
    email: EmailStr
    controller_code: str

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

@router.post("/add-controller")
def add_controller(data: ControllerUpdate):
    """Endpoint to link a controller code to a user."""
    connection = get_db_connection()
    if not connection:
        raise HTTPException(status_code=500, detail="Database connection failed")

    try:
        cursor = connection.cursor(dictionary=True)
        
        # 1. Check current user status
        cursor.execute("SELECT controller1, controller2 FROM user WHERE email = %s", (data.email,))
        user = cursor.fetchone()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # 2. Determine which controller slot is empty and update BOTH tables using the email
        if user["controller1"] is None:
            # Update user table
            cursor.execute("UPDATE user SET controller1 = %s WHERE email = %s", (data.controller_code, data.email))
            # Update controlls table using the new email foreign key
            cursor.execute("UPDATE controlls SET controller1 = %s WHERE email = %s", (data.controller_code, data.email))
            
        elif user["controller2"] is None:
            # Update user table
            cursor.execute("UPDATE user SET controller2 = %s WHERE email = %s", (data.controller_code, data.email))
            # Update controlls table using the new email foreign key
            cursor.execute("UPDATE controlls SET controller2 = %s WHERE email = %s", (data.controller_code, data.email))
            
        else:
            raise HTTPException(status_code=400, detail="Maximum of 2 controllers already linked")

        # 3. Commit changes to both tables
        connection.commit()

        return {"status": "success", "message": "Controller added successfully"}

    except Error as e:
        connection.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()