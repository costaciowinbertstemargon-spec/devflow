export const swaggerDocument = {
    openapi: '3.0.0',
    info: {
        title: 'DevFlow API',
        version: '1.0.0',
        description: 
            "REST API for task and project collaboration in DevFlow.",
    },
    servers: [
        {
            url: 'http://localhost:5000',
            description: 'Local development server',
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
    },
    paths: {
        "/api/health": {
            get: {
                summary: "Check API and database health",
                tags: ["Health"],
                responses: {
                    "200": {
                    description: "API and database are healthy",
                    },
                    "500": {
                    description: "Database connection failed",
                    },
                },
            },
        },

        "/api/auth/register": {
            post: {
                summary: "Register a new user",
                tags: ["Authentication"],
                requestBody: {
                    required: true,
                    content: {
                    "application/json": {
                            schema: {
                                type: "object",
                                required: ["name", "email", "password"],
                                properties: {
                                    name: {
                                        type: "string",
                                        example: "John Doe",
                                    },
                                    email: {
                                        type: "string",
                                        format: "email",
                                        example: "john@example.com",
                                    },
                                    password: {
                                        type: "string",
                                        format: "password",
                                        example: "password123",
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    "201": {
                        description: "User registered successfully",
                    },
                    "400": {
                        description: "Validation failed",
                    },
                    "409": {
                        description: "Email already registered",
                    },
                },
            },
        },

        "/api/auth/login": {
            post: {
                summary: "Login user",
                tags: ["Authentication"],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["email", "password"],
                                properties: {
                                    email: {
                                        type: "string",
                                        format: "email",
                                        example: "john@example.com",
                                    },
                                    password: {
                                        type: "string",
                                        format: "password",
                                        example: "password123",
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "Login successful",
                    },
                    "400": {
                        description: "Validation failed",
                    },
                    "401": {
                        description: "Invalid credentials",
                    },
                },
            },
        },

        "/api/organizations": {
            post: {
            summary: "Create an organization",
            tags: ["Organizations"],
            security: [
                {
                bearerAuth: [],
                },
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["name"],
                            properties: {
                                name: {
                                    type: "string",
                                    example: "DevFlow Team",    
                                },
                                description: {
                                    type: "string",
                                    example: "A collaborative workspace",
                                },
                            },
                        },
                    },
                },
            },
            responses: {
                "201": {
                    description: "Organization created successfully",
                },
                "400": {
                    description: "Validation failed",
                },
                "401": {
                    description: "Authentication required",
                },
            },
            },
        },

        "/api/organizations/{organizationId}/members": {
            post: {
                summary: "Add a member to an organization",
                tags: ["Organizations"],
                security: [
                    {
                    bearerAuth: [],
                    },
                ],
                parameters: [
                    {
                        name: "organizationId",
                        in: "path",
                        required: true,
                        schema: {
                            type: "string",
                            format: "uuid",
                        },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["email", "role"],
                                properties: {
                                    email: {
                                        type: "string",
                                        format: "email",
                                        example: "member@example.com",
                                    },
                                    role: {
                                        type: "string",
                                        enum: ["ADMIN", "MEMBER"],
                                        example: "MEMBER",
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    "201": {
                        description: "Member added successfully",
                    },
                    "400": {
                        description: "Validation failed",
                    },
                    "401": {
                        description: "Authentication required",
                    },
                    "403": {
                        description: "Insufficient permissions",
                    },
                    "404": {
                        description: "User or organization not found",
                    },
                    "409": {
                        description: "User is already a member",
                    },
                },
            },
        },

        "/api/organizations/{organizationId}/projects": {
            post: {
                summary: "Create a project",
                tags: ["Projects"],
                security: [
                    {
                        bearerAuth: [],
                    },
                ],
                parameters: [
                    {
                        name: "organizationId",
                        in: "path",
                        required: true,
                        schema: {
                            type: "string",
                            format: "uuid",
                        },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["name"],
                                properties: {
                                    name: {
                                        type: "string",
                                        example: "Website Redesign",
                                    },
                                    description: {
                                        type: "string",
                                        example: "Redesign the company website",
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    "201": {
                        description: "Project created successfully",
                    },
                    "400": {
                        description: "Validation failed",
                    },
                    "401": {
                        description: "Authentication required",
                    },
                    "403": {
                        description: "User is not a member of the organization",
                    },
                },
            },

            get: {
                summary: "Get projects for an organization",
                tags: ["Projects"],
                security: [
                    {
                        bearerAuth: [],
                    },
                ],
                parameters: [
                    {
                        name: "organizationId",
                        in: "path",
                        required: true,
                        schema: {
                            type: "string",
                            format: "uuid",
                        },
                    },
                ],
                responses: {
                    "200": {
                        description: "Projects retrieved successfully",
                    },
                    "401": {
                        description: "Authentication required",
                    },
                    "403": {
                        description: "User is not a member of the organization",
                    },
                    "404": {
                        description: "Organization not found",
                    },
                },
            },
        },

        "/api/projects/{projectId}": {
            get: {
                summary: "Get a project",
                tags: ["Projects"],
                security: [
                    {
                        bearerAuth: [],
                    },
                ],
                parameters: [
                    {
                        name: "projectId",
                        in: "path",
                        required: true,
                        schema: {
                            type: "string",
                            format: "uuid",
                        },
                    },
                ],
                responses: {
                    "200": {
                        description: "Project retrieved successfully",
                    },
                    "401": {
                        description: "Authentication required",
                    },
                    "403": {
                        description: "User is not a member of the organization",
                    },
                    "404": {
                        description: "Project not found",
                    },
                },
            },
        },

        "/api/projects/{projectId}/tasks": {
            post: {
                summary: "Create a task",
                tags: ["Tasks"],
                security: [
                    {
                        bearerAuth: [],
                    },
                ],
                parameters: [
                    {
                        name: "projectId",
                        in: "path",
                        required: true,
                        schema: {
                            type: "string",
                            format: "uuid",
                        },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["title"],
                            properties: {
                                title: {
                                    type: "string",
                                    example: "Prepare monthly report",
                                },
                                description: {
                                    type: "string",
                                    example: "Prepare and submit the monthly report.",
                                },
                                priority: {
                                    type: "string",
                                    enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
                                    example: "HIGH",
                                },
                                dueDate: {
                                    type: "string",
                                    format: "date-time",
                                    nullable: true,
                                    example: "2026-12-31T23:59:59.000Z",
                                },
                                assigneeId: {
                                    type: "string",
                                    format: "uuid",
                                    nullable: true,
                                    example: "00000000-0000-0000-0000-000000000000",
                                },
                            },
                        },
                    },
                    },
                },
                responses: {
                    "201": {
                        description: "Task created successfully",
                    },
                    "400": {
                        description: "Validation failed",
                    },
                    "401": {
                        description: "Authentication required",
                    },
                    "403": {
                        description: "User is not a member of the organization",
                    },
                    "404": {
                        description: "Project not found",
                    },
                },
            },

            get: {
                summary: "Get tasks for a project",
                tags: ["Tasks"],
                security: [
                    {
                        bearerAuth: [],
                    },
                ],
                parameters: [
                    {
                        name: "projectId",
                        in: "path",
                        required: true,
                        schema: {
                            type: "string",
                            format: "uuid",
                        },
                    },
                    {
                        name: "status",
                        in: "query",
                        required: false,
                        schema: {
                            type: "string",
                            enum: ["TODO", "IN_PROGRESS", "REVIEW", "DONE"],
                        },
                    },
                    {
                        name: "priority",
                        in: "query",
                        required: false,
                        schema: {
                            type: "string",
                            enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
                        },
                    },
                    {
                        name: "assigneeId",
                        in: "query",
                        required: false,
                        schema: {
                            type: "string",
                            format: "uuid",
                        },
                    },
                ],
                responses: {
                    "200": {
                        description: "Tasks retrieved successfully",
                    },
                    "400": {
                        description: "Invalid query parameters",
                    },
                    "401": {
                        description: "Authentication required",
                    },
                    "403": {
                        description: "User is not a member of the organization",
                    },
                    "404": {
                        description: "Project not found",
                    },
                },
            },
        },

        "/api/tasks/{taskId}": {
            get: {
                summary: "Get a task",
                tags: ["Tasks"],
                security: [
                    {
                        bearerAuth: [],
                    },
                ],
                parameters: [
                    {
                        name: "taskId",
                        in: "path",
                        required: true,
                        schema: {
                            type: "string",
                            format: "uuid",
                        },
                    },
                ],
                responses: {
                    "200": {
                       description: "Task retrieved successfully",
                    },
                    "401": {
                        description: "Authentication required",
                    },
                    "403": {
                        description: "User is not a member of the organization",
                    },
                    "404": {
                        description: "Task not found",
                    },
                },
            },

            patch: {
                summary: "Update a task",
                tags: ["Tasks"],
                security: [
                    {
                        bearerAuth: [],
                    },
                ],
                parameters: [
                    {
                        name: "taskId",
                        in: "path",
                        required: true,
                        schema: {
                            type: "string",
                            format: "uuid",
                        },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    title: {
                                        type: "string",
                                        example: "Updated task title",
                                    },
                                    description: {
                                        type: "string",
                                        nullable: true,
                                        example: "Updated task description",
                                    },
                                    status: {
                                        type: "string",
                                        enum: ["TODO", "IN_PROGRESS", "REVIEW", "DONE"],
                                        example: "IN_PROGRESS",
                                    },
                                    priority: {
                                        type: "string",
                                        enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
                                        example: "HIGH",
                                    },
                                    dueDate: {
                                        type: "string",
                                        format: "date-time",
                                        nullable: true,
                                        example: "2026-12-31T23:59:59.000Z",
                                    },
                                    assigneeId: {
                                        type: "string",
                                        format: "uuid",
                                        nullable: true,
                                        example: "00000000-0000-0000-0000-000000000000",
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "Task updated successfully",
                    },
                    "400": {
                        description: "Validation failed",
                    },
                    "401": {
                        description: "Authentication required",
                    },
                    "403": {
                        description: "User is not authorized to update this task",
                    },
                    "404": {
                        description: "Task or assignee not found",
                    },
                },
            },
        },

        "/api/tasks/{taskId}/comments": {
            post: {
                summary: "Create a comment to a task",
                tags: ["Comments"],
                security: [
                    {
                        bearerAuth: [],
                    },
                ],
                parameters: [
                    {
                        name: "taskId",
                        in: "path",
                        required: true,
                        schema: {
                            type: "string",
                            format: "uuid",
                        },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["content"],
                                properties: {
                                    content: {
                                        type: "string",
                                        example: "I'll work on this task today.",
                                        maxLength: 500,
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    "201": {
                        description: "Comment created successfully",
                    },
                    "400": {
                        description: "Validation failed",
                    },
                    "401": {
                        description: "Authentication required",
                    },
                    "403": {
                        description: "User is not a member of the organization",
                    },
                    "404": {
                        description: "Task not found",
                    },
                },
            },
        },

        "/api/tasks/{taskId}/activities": {
            get: {
                summary: "Get task activity history",
                tags: ["Activities"],
                security: [
                    {
                        bearerAuth: [],
                    },
                ],
                parameters: [
                    {
                        name: "taskId",
                        in: "path",
                        required: true,
                        schema: {
                            type: "string",
                            format: "uuid",
                        },
                    },
                ],
                responses: {
                    "200": {
                        description: "Activities retrieved successfully",
                    },
                    "401": {
                        description: "Authentication required",
                    },
                    "403": {
                        description: "User is not a member of the organization",
                    },
                    "404": {
                        description: "Task not found",
                    },
                },
            },
        },

        "/api/notifications": {
            get: {
                summary: "Get notifications for the authenticated user",
                tags: ["Notifications"],
                security: [
                    {
                        bearerAuth: [],
                    },
                ],
                responses: {
                    "200": {
                        description: "Notifications retrieved successfully",
                    },
                    "401": {
                        description: "Authentication required",
                    },
                },
            },
        },

        "/api/notifications/{notificationId}/read": {
            patch: {
                summary: "Mark a notification as read",
                tags: ["Notifications"],
                security: [
                    {
                        bearerAuth: [],
                    },
                ],
                parameters: [
                    {
                        name: "notificationId",
                        in: "path",
                        required: true,
                        schema: {
                            type: "string",
                            format: "uuid",
                        },
                    },
                ],
                responses: {
                    "200": {
                        description: "Notification marked as read",
                    },
                    "401": {
                        description: "Authentication required",
                    },
                    "404": {
                        description: "Notification not found",
                    },
                },
            },
        },

        "/api/notifications/read-all": {
            patch: {
                summary: "Mark all notifications as read",
                tags: ["Notifications"],
                security: [
                    {
                        bearerAuth: [],
                    },
                ],
                responses: {
                    "200": {
                        description: "All notifications marked as read",
                    },
                    "401": {
                        description: "Authentication required",
                    },
                },
            },
        },
    },
};