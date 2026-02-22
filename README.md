
 
 Authentication
Base URL: /api/auth
Method	Endpoint	Access	Description
POST	/login	Public	Login for all users (returns JWT token)
POST	/register	Public	Should be removed/protected
Login Request Body:
         
    {    
      "name": "string",    
      "password": "string"    
    }    
         
Login Response:
      
    {    
      "token": "JWT_TOKEN",    
      "user": {    
        "id": "string",    
        "name": "string",    
        "email": "string",    
        "role": "super-admin | admin | worker | public-user"    
      }    
    }    
         

 User Management (Super Admin Only)
Base URL: /api/users
All routes require: Authorization: Bearer <token> + super-admin role
 
Method	Endpoint	Description
GET	/	Get all users
GET	/:id	Get user by ID
POST	/	Create new user (assign role)
PUT	/:id	Update user details/role
DELETE	/:id	Delete specific user
DELETE	/	Delete all users 
Create User Request:
 
         
    {    
      "first_name": "string",    
      "last_name": "string",    
      "name": "string",    
      "email": "string",    
      "password": "string",    
      "government_id": "string",    
      "role": "super-admin | admin | worker | public-user"    
    }    
         
 

 
 Nodes Management (Admin Only)
Base URL: /api/nodes
Required: Authorization: Bearer <token> + super-admin or admin role
 
Method	Endpoint	Description
GET	/	Get all nodes
GET	/:id	Get node by ID
POST	/	Create new node
PUT	/:id	Update node information
PATCH	/:id/status	Update node status (active/inactive/maintenance)
DELETE	/:id	Delete node
Create Node Request:
 
         
    {    
      "node_id": "string",    
      "location": "string",    
      "sensor_id": "string",    
      "coordinates": {    
        "latitude": "number",    
        "longitude": "number"    
      },    
      "description": "string"    
    }    
         
 
Node Statuses:
 
●	active - Node is operational
●	inactive - Node is not operational
●	maintenance - Node is under maintenance
 

 
Tasks Management
Base URL: /api/tasks
Admin Routes
Required: Authorization: Bearer <token> + super-admin or admin role
 
Method	Endpoint	Description
GET	/	Get all tasks
POST	/	Create new task
DELETE	/:id	Delete task
PATCH	/:id/delegate	Delegate task to another worker
Worker Routes
Required: Authorization: Bearer <token> + worker role
 
Method	Endpoint	Description
GET	/my-tasks	Get tasks assigned to me
PATCH	/:id/accept	Accept assigned task
Shared Routes (Admin + Worker)
Method	Endpoint	Access	Description
GET	/:id	Admin/Worker	Get task by ID
PATCH	/:id/status	Admin/Worker	Update task status
Create Task Request:
 
         
    {    
      "task_id": "string",    
      "title": "string",    
      "description": "string",    
      "assigned_to": "user_id",    
      "node_id": "node_id",    
      "priority": "low | medium | high"    
    }    
         
 
Task Statuses:
 
●	pending - Task created, not accepted
●	ongoing - Task accepted and in progress
●	resolved - Task completed
 
 






 Maintenance Management
Base URL: /api/maintenance
Admin Routes
Required: Authorization: Bearer <token> + super-admin or admin role
 
Method	Endpoint	Description
GET	/	Get all maintenance logs
GET	/node/:nodeId	Get logs by node
GET	/worker/:workerId	Get logs by worker
GET	/download	Download logs (JSON)
DELETE	/:id	Delete maintenance log
Worker Routes
Required: Authorization: Bearer <token> + worker role
 
Method	Endpoint	Description
GET	/my-logs	Get my maintenance logs
POST	/	Create new maintenance log
Shared Routes
Method	Endpoint	Access	Description
GET	/:id	Admin/Worker	Get log by ID
Create Maintenance Log Request:
 
         
    {    
      "task_id": "task_id",    
      "node_id": "node_id",    
      "action_taken": "string (required)",    
      "parts_replaced": ["string"],    
      "notes": "string",    
      "images": ["url"]    
    }    
         
 
Download Logs Query Parameters:
 
         
    ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&nodeId=xxx&workerId=xxx    
         
 

 
Sensor Data Management
Base URL: /api/data
Method	Endpoint	Access	Description
GET	/export	Public	Get all sensor data
GET	/latest	Public	Get latest sensor readings
GET	/alerts	Public	Get alert status data
POST	/	Public	Post new sensor data (IoT devices)
PATCH	/alert-status/:id	Auth Required	Update alert status
Post Sensor Data Request:

    {    
      "sensor_id": "string",    
      "flow_rate": "number",    
      "water_level": "number",    
      "status": "0 | 1 | 2 | 3",    
      "delta_water_level": "number",    
      "distance": "number",    
      "rain": "number",    
      "batteryVoltage": "number",    
      "batteryPercent": "number"    
    }    
          
Sensor Status Values:
 
●	0 - Normal
●	1 - At Risk
●	2 - Clogged
●	3 - Overflow
 
Alert Status Values:
 
●	unresolved - Alert not addressed
●	ongoing - Alert being worked on
●	resolved - Alert resolved

Public Routes (No Authentication)
Base URL: /api/public
Method	Endpoint	Description
GET	/flood-risk	Get flood risk info for all active nodes
GET	/overflow-predictions	Get overflow predictions
GET	/nodes	Get list of active nodes
GET	/nodes/:nodeId	Get public node details
GET	/nodes/:nodeId/history	Get historical data (clog/overflow events)
Query Parameters for History:
         
    ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&limit=100    
         

 
Role-Based Access Summary
Role	Access
Super Admin	All routes + User Management
Admin	Nodes, Tasks, Maintenance, Data (view/manage)
Worker	My Tasks, Accept Tasks, Create Maintenance Logs
Public User	Public routes only (flood info, predictions)

 
 Common Headers
Authenticated Requests:
    Authorization: Bearer <JWT_TOKEN>    
    Content-Type: application/json          

 
Error Responses
401 Unauthorized:
    {    
      "message": "Not authenticated"    
    }    
         
403 Forbidden:
    {    
      "message": "Access denied"    
    }    
         
404 Not Found:

    {    
      "message": "Resource not found"    
    }    
         
 
400 Bad Request:

    {    
      "message": "Validation error message"    
    }    
         



500 Server Error:
 
    {    
      message": "Server Error",    
  "error": "error details"    
    }    
         
 

 Notes
1. Base URL: http://localhost:5001 (development)
2. JWT Token: Store token after login, include in Authorization header for protected routes
3. Token Expiration: Check your JWT configuration in auth middleware
4. CORS: Frontend must be on http://localhost:5173
5. Remove Public Registration: /api/auth/register should be removed or protected
 
Typical User Flows
Super Admin Flow:
1. Login → /api/auth/login
2. Create Admin Account → POST /api/users (role: admin)
3. Create Worker Account → POST /api/users (role: worker)
4. View All Users → GET /api/users
 
Admin Flow:
1. Login → /api/auth/login
2. Add Node → POST /api/nodes
3. Create Task → POST /api/tasks (assign to worker)
4. View Maintenance Logs → GET /api/maintenance
 
Worker Flow:
1. Login → /api/auth/login
2. View My Tasks → GET /api/tasks/my-tasks
3. Accept Task → PATCH /api/tasks/:id/accept
4. Update Status → PATCH /api/tasks/:id/status (ongoing)
5. Perform Maintenance → Physical work
6. Log Maintenance → POST /api/maintenance
7. Complete Task → PATCH /api/tasks/:id/status (resolved)
 
Public User Flow:
1. View Flood Risk → GET /api/public/flood-risk
2. View Predictions → GET /api/public/overflow-predictions
3. View Node Details → GET /api/public/nodes/:nodeId
4. View History → GET /api/public/nodes/:nodeId/history
 

