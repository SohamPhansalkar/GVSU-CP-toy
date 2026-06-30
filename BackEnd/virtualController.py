from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
import mysql.connector
from mysql.connector import Error

router = APIRouter()

# Expected data payload from the frontend
class ControllerAction(BaseModel):
    email: EmailStr
    controller_id: str
    action: str

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

@router.post("/controller-action")
def handle_controller_action(data: ControllerAction):
    """Endpoint to update controller counts based on button presses."""
    connection = get_db_connection()
    if not connection:
        raise HTTPException(status_code=500, detail="Database connection failed")

    try:
        cursor = connection.cursor()

        # Determine the SQL query based on the action received
        if data.action == "R":
            query = """
                UPDATE controlls 
                SET mainCount = mainCount + 1, count1 = count1 + 1 
                WHERE email = %s AND (controller1 = %s OR controller2 = %s)
            """
        elif data.action == "L":
            query = """
                UPDATE controlls 
                SET mainCount = mainCount - 1, count2 = count2 + 1 
                WHERE email = %s AND (controller1 = %s OR controller2 = %s)
            """
        elif data.action == "SEL":
            query = """
                UPDATE controlls 
                SET count3 = count3 + 1 
                WHERE email = %s AND (controller1 = %s OR controller2 = %s)
            """
        else:
            raise HTTPException(status_code=400, detail="Invalid action command")

        # Execute the query passing the email and controller_id (checked against both slots)
        cursor.execute(query, (data.email, data.controller_id, data.controller_id))
        
        # Commit the transaction
        connection.commit()

        # Verify if the database actually updated a row
        if cursor.rowcount == 0:
            raise HTTPException(
                status_code=404, 
                detail=f"No matching DB record found for email {data.email} and controller {data.controller_id}. Did you Add the Controller first?"
            )

        return {"status": "success", "message": f"Action '{data.action}' processed successfully"}

    except Error as e:
        connection.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()