from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
import mysql.connector
from mysql.connector import Error

router = APIRouter()

# Expected data payload for /check
class ActivityRequest(BaseModel):
    controller_id: str

# Expected data payload for /reset
class ResetRequest(BaseModel):
    email: EmailStr

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

@router.post("/reset")
def reset_activity(data: ResetRequest):
    """Endpoint to reset all counts to 0 for a specific user using their email."""
    connection = get_db_connection()
    if not connection:
        raise HTTPException(status_code=500, detail="Database connection failed")

    try:
        cursor = connection.cursor(dictionary=True)

        select_query = "SELECT controller1, controller2 FROM controlls WHERE email = %s"
        cursor.execute(select_query, (data.email,))
        result = cursor.fetchone()

        if not result:
            raise HTTPException(
                status_code=404, 
                detail=f"No matching DB record found for email {data.email}."
            )

        update_query = """
            UPDATE controlls 
            SET mainCount = 0, count1 = 0, count2 = 0, count3 = 0, count4 = 0 
            WHERE email = %s
        """
        
        cursor.execute(update_query, (data.email,))
        connection.commit()

        return {
            "status": "success", 
            "message": "All counts have been reset to 0.",
            "controller1": result["controller1"],
            "controller2": result["controller2"]
        }

    except Error as e:
        connection.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()


@router.post("/check")
def check_activity(data: ActivityRequest):
    """Endpoint to retrieve the current counts for a specific controller."""
    connection = get_db_connection()
    if not connection:
        raise HTTPException(status_code=500, detail="Database connection failed")

    try:
        # dictionary=True ensures we get a JSON-friendly dict back instead of a tuple
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT mainCount, count1, count2, count3, count4 
            FROM controlls 
            WHERE controller1 = %s OR controller2 = %s
        """
        
        cursor.execute(query, (data.controller_id, data.controller_id))
        result = cursor.fetchone()

        if not result:
            raise HTTPException(
                status_code=404, 
                detail=f"No matching DB record found for controller {data.controller_id}."
            )

        return {
            "status": "success", 
            "data": result
        }

    except Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()