import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../app.js";

describe("Tasks API", () => {
    it("should reject task creation without authentication", async () => {
        const fakeProjectId = "00000000-0000-0000-0000-000000000000";

        const response = await request(app)
        .post(`/api/projects/${fakeProjectId}/tasks`)
        .send({
            title: "Test Task",
            description: "Testing task creation",
        });

        expect(response.status).toBe(401);
    });
    
    it("should create a task for an authenticated project member", async () => {
        const email = `task-${Date.now()}@example.com`;
        const password = "password123";

        // Register
        const registerResponse = await request(app)
            .post("/api/auth/register")
            .send({
            name: "Task Test User",
            email,
            password,
            });

        expect(registerResponse.status).toBe(201);

        // Login
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
            email,
            password,
            });

        expect(loginResponse.status).toBe(200);

        const token = loginResponse.body.token;

        // Create organization
        const organizationResponse = await request(app)
            .post("/api/organizations")
            .set("Authorization", `Bearer ${token}`)
            .send({
            name: `Task Test Organization ${Date.now()}`,
            description: "Testing task creation",
            });

        expect(organizationResponse.status).toBe(201);

        const organizationId = organizationResponse.body.organization.id;

        // Create project
        const projectResponse = await request(app)
            .post(`/api/organizations/${organizationId}/projects`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            name: "Task Test Project",
            description: "Testing task creation",
            });

        expect(projectResponse.status).toBe(201);

        const projectId = projectResponse.body.project.id;

        // Create task
        const taskResponse = await request(app)
            .post(`/api/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            title: "Test Task",
            description: "Testing task creation",
            priority: "HIGH",
            });

        expect(taskResponse.status).toBe(201);
        expect(taskResponse.body.status).toBe("success");
    });

    it("should reject task creation with invalid data", async () => {
        const email = `task-validation-${Date.now()}@example.com`;
        const password = "password123";

        // Register
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Task Validation User",
            email,
            password,
            });

        // Login
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
            email,
            password,
            });

        expect(loginResponse.status).toBe(200);

        const token = loginResponse.body.token;

        // Create organization
        const organizationResponse = await request(app)
            .post("/api/organizations")
            .set("Authorization", `Bearer ${token}`)
            .send({
            name: `Task Validation Organization ${Date.now()}`,
            description: "Testing task validation",
            });

        expect(organizationResponse.status).toBe(201);

        const organizationId = organizationResponse.body.organization.id;

        // Create project
        const projectResponse = await request(app)
            .post(`/api/organizations/${organizationId}/projects`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            name: "Task Validation Project",
            description: "Testing task validation",
            });

        expect(projectResponse.status).toBe(201);

        const projectId = projectResponse.body.project.id;

        // Invalid task data
        const taskResponse = await request(app)
            .post(`/api/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            title: "",
            priority: "INVALID_PRIORITY",
            });

        expect(taskResponse.status).toBe(400);
        expect(taskResponse.body.status).toBe("error");
        expect(taskResponse.body.message).toBe("Validation failed");
    });

    it("should update an existing task", async () => {
        const email = `task-update-${Date.now()}@example.com`;
        const password = "password123";

        // Register
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Task Update User",
            email,
            password,
            });

        // Login
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
            email,
            password,
            });

        expect(loginResponse.status).toBe(200);

        const token = loginResponse.body.token;

        // Create organization
        const organizationResponse = await request(app)
            .post("/api/organizations")
            .set("Authorization", `Bearer ${token}`)
            .send({
            name: `Task Update Organization ${Date.now()}`,
            description: "Testing task updates",
            });

        expect(organizationResponse.status).toBe(201);

        const organizationId = organizationResponse.body.organization.id;

        // Create project
        const projectResponse = await request(app)
            .post(`/api/organizations/${organizationId}/projects`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            name: "Task Update Project",
            description: "Testing task updates",
            });

        expect(projectResponse.status).toBe(201);

        const projectId = projectResponse.body.project.id;

        // Create task
        const taskResponse = await request(app)
            .post(`/api/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            title: "Original Task Title",
            description: "Original description",
            priority: "LOW",
            });

        expect(taskResponse.status).toBe(201);

        const taskId = taskResponse.body.task.id;

        // Update task
        const updateResponse = await request(app)
            .patch(`/api/tasks/${taskId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            title: "Updated Task Title",
            description: "Updated description",
            status: "IN_PROGRESS",
            priority: "HIGH",
            });

        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.status).toBe("success");
    });

    it("should record activities when a task is updated", async () => {
        const email = `activity-${Date.now()}@example.com`;
        const password = "password123";

        // Register
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Activity Test User",
            email,
            password,
            });

        // Login
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
            email,
            password,
            });

        expect(loginResponse.status).toBe(200);

        const token = loginResponse.body.token;

        // Create organization
        const organizationResponse = await request(app)
            .post("/api/organizations")
            .set("Authorization", `Bearer ${token}`)
            .send({
            name: `Activity Organization ${Date.now()}`,
            description: "Testing activities",
            });

        expect(organizationResponse.status).toBe(201);

        const organizationId = organizationResponse.body.organization.id;

        // Create project
        const projectResponse = await request(app)
            .post(`/api/organizations/${organizationId}/projects`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            name: "Activity Test Project",
            description: "Testing activities",
            });

        expect(projectResponse.status).toBe(201);

        const projectId = projectResponse.body.project.id;

        // Create task
        const taskResponse = await request(app)
            .post(`/api/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            title: "Activity Test Task",
            description: "Original description",
            priority: "LOW",
            });

        expect(taskResponse.status).toBe(201);

        const taskId = taskResponse.body.task.id;

        // Update task
        const updateResponse = await request(app)
            .patch(`/api/tasks/${taskId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            title: "Updated Activity Task",
            status: "IN_PROGRESS",
            priority: "HIGH",
            });

        expect(updateResponse.status).toBe(200);

        // Get activities
        const activitiesResponse = await request(app)
            .get(`/api/tasks/${taskId}/activities`)
            .set("Authorization", `Bearer ${token}`);

        expect(activitiesResponse.status).toBe(200);
        expect(activitiesResponse.body.status).toBe("success");

        const activities = activitiesResponse.body.activities;

        expect(Array.isArray(activities)).toBe(true);
        expect(activities.length).toBeGreaterThan(0);

        const actions = activities.map(
            (activity: { action: string }) => activity.action
        );

        expect(actions).toContain("TASK_UPDATED");
        expect(actions).toContain("STATUS_CHANGED");
        expect(actions).toContain("PRIORITY_CHANGED");
    });

    it("should reject activity access from a user outside the organization", async () => {
        const ownerEmail = `activity-owner-${Date.now()}@example.com`;
        const outsiderEmail = `activity-outsider-${Date.now()}@example.com`;
        const password = "password123";

        // Register owner
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Activity Owner",
            email: ownerEmail,
            password,
            });

        // Login owner
        const ownerLogin = await request(app)
            .post("/api/auth/login")
            .send({
            email: ownerEmail,
            password,
            });

        expect(ownerLogin.status).toBe(200);

        const ownerToken = ownerLogin.body.token;

        // Create organization
        const organizationResponse = await request(app)
            .post("/api/organizations")
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            name: `Activity Security Organization ${Date.now()}`,
            description: "Testing activity security",
            });

        expect(organizationResponse.status).toBe(201);

        const organizationId = organizationResponse.body.organization.id;

        // Create project
        const projectResponse = await request(app)
            .post(`/api/organizations/${organizationId}/projects`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            name: "Activity Security Project",
            description: "Testing activity security",
            });

        expect(projectResponse.status).toBe(201);

        const projectId = projectResponse.body.project.id;

        // Create task
        const taskResponse = await request(app)
            .post(`/api/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            title: "Protected Activity Task",
            description: "Testing activity access",
            priority: "MEDIUM",
            });

        expect(taskResponse.status).toBe(201);

        const taskId = taskResponse.body.task.id;

        // Register outsider
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Activity Outsider",
            email: outsiderEmail,
            password,
            });

        // Login outsider
        const outsiderLogin = await request(app)
            .post("/api/auth/login")
            .send({
            email: outsiderEmail,
            password,
            });

        expect(outsiderLogin.status).toBe(200);

        const outsiderToken = outsiderLogin.body.token;

        // Try to access protected task activities
        const activitiesResponse = await request(app)
            .get(`/api/tasks/${taskId}/activities`)
            .set("Authorization", `Bearer ${outsiderToken}`);

        expect(activitiesResponse.status).toBe(403);
    });

    it("should reject task updates from a user outside the organization", async () => {
        const ownerEmail = `task-owner-${Date.now()}@example.com`;
        const outsiderEmail = `task-outsider-${Date.now()}@example.com`;
        const password = "password123";

        // Register owner
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Task Owner",
            email: ownerEmail,
            password,
            });

        // Login owner
        const ownerLogin = await request(app)
            .post("/api/auth/login")
            .send({
            email: ownerEmail,
            password,
            });

        expect(ownerLogin.status).toBe(200);

        const ownerToken = ownerLogin.body.token;

        // Create organization
        const organizationResponse = await request(app)
            .post("/api/organizations")
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            name: `Task Security Organization ${Date.now()}`,
            description: "Testing task authorization",
            });

        expect(organizationResponse.status).toBe(201);

        const organizationId = organizationResponse.body.organization.id;

        // Create project
        const projectResponse = await request(app)
            .post(`/api/organizations/${organizationId}/projects`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            name: "Task Security Project",
            description: "Testing task authorization",
            });

        expect(projectResponse.status).toBe(201);

        const projectId = projectResponse.body.project.id;

        // Create task
        const taskResponse = await request(app)
            .post(`/api/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            title: "Protected Task",
            description: "This task should not be editable by outsiders",
            priority: "MEDIUM",
            });

        expect(taskResponse.status).toBe(201);

        const taskId = taskResponse.body.task.id;

        // Register outsider
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Task Outsider",
            email: outsiderEmail,
            password,
            });

        // Login outsider
        const outsiderLogin = await request(app)
            .post("/api/auth/login")
            .send({
            email: outsiderEmail,
            password,
            });

        expect(outsiderLogin.status).toBe(200);

        const outsiderToken = outsiderLogin.body.token;

        // Outsider attempts to update the task
        const updateResponse = await request(app)
            .patch(`/api/tasks/${taskId}`)
            .set("Authorization", `Bearer ${outsiderToken}`)
            .send({
            title: "Unauthorized Update",
            status: "DONE",
            });

        expect(updateResponse.status).toBe(403);
    });

    it("should create a notification when a task is assigned", async () => {
        const ownerEmail = `assign-owner-${Date.now()}@example.com`;
        const assigneeEmail = `assign-user-${Date.now()}@example.com`;
        const password = "password123";

        // Register owner
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Assignment Owner",
            email: ownerEmail,
            password,
            });

        // Register assignee
        const assigneeRegister = await request(app)
            .post("/api/auth/register")
            .send({
            name: "Assignment User",
            email: assigneeEmail,
            password,
            });

        expect(assigneeRegister.status).toBe(201);

        const assigneeId = assigneeRegister.body.user.id;

        // Login owner
        const ownerLogin = await request(app)
            .post("/api/auth/login")
            .send({
            email: ownerEmail,
            password,
            });

        expect(ownerLogin.status).toBe(200);

        const ownerToken = ownerLogin.body.token;

        // Login assignee
        const assigneeLogin = await request(app)
            .post("/api/auth/login")
            .send({
            email: assigneeEmail,
            password,
            });

        expect(assigneeLogin.status).toBe(200);

        const assigneeToken = assigneeLogin.body.token;

        // Create organization
        const organizationResponse = await request(app)
            .post("/api/organizations")
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            name: `Assignment Organization ${Date.now()}`,
            description: "Testing task assignment notifications",
            });

        expect(organizationResponse.status).toBe(201);

        const organizationId = organizationResponse.body.organization.id;

        // Add assignee to organization
        const memberResponse = await request(app)
            .post(`/api/organizations/${organizationId}/members`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            email: assigneeEmail,
            role: "MEMBER",
            });

        expect(memberResponse.status).toBe(201);

        // Create project
        const projectResponse = await request(app)
            .post(`/api/organizations/${organizationId}/projects`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            name: "Assignment Project",
            description: "Testing task assignment notifications",
            });

        expect(projectResponse.status).toBe(201);

        const projectId = projectResponse.body.project.id;

        // Create task
        const taskResponse = await request(app)
            .post(`/api/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            title: "Assignment Test Task",
            description: "Testing task assignment notification",
            priority: "HIGH",
            });

        expect(taskResponse.status).toBe(201);

        const taskId = taskResponse.body.task.id;

        // Assign task
        const updateResponse = await request(app)
            .patch(`/api/tasks/${taskId}`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            assigneeId,
            });

        expect(updateResponse.status).toBe(200);

        // Check assignee notifications
        const notificationsResponse = await request(app)
            .get("/api/notifications")
            .set("Authorization", `Bearer ${assigneeToken}`);

        expect(notificationsResponse.status).toBe(200);

        const notifications = notificationsResponse.body.notifications;

        expect(notifications.length).toBeGreaterThan(0);

        const assignmentNotification = notifications.find(
            (notification: { type: string; taskId?: string }) =>
            notification.type === "TASK_ASSIGNED" &&
            notification.taskId === taskId
        );

        expect(assignmentNotification).toBeDefined();
        expect(assignmentNotification.isRead).toBe(false);
    });

    it("should reject assigning a task to a user outside the organization", async () => {
        const ownerEmail = `assign-owner-${Date.now()}@example.com`;
        const outsiderEmail = `assign-outsider-${Date.now()}@example.com`;
        const password = "password123";

        // Register owner
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Assignment Owner",
            email: ownerEmail,
            password,
            });

        // Register outsider
        const outsiderRegister = await request(app)
            .post("/api/auth/register")
            .send({
            name: "Assignment Outsider",
            email: outsiderEmail,
            password,
            });

        expect(outsiderRegister.status).toBe(201);

        const outsiderId = outsiderRegister.body.user.id;

        // Login owner
        const ownerLogin = await request(app)
            .post("/api/auth/login")
            .send({
            email: ownerEmail,
            password,
            });

        expect(ownerLogin.status).toBe(200);

        const ownerToken = ownerLogin.body.token;

        // Create organization
        const organizationResponse = await request(app)
            .post("/api/organizations")
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            name: `Assignment Security Organization ${Date.now()}`,
            description: "Testing assignment authorization",
            });

        expect(organizationResponse.status).toBe(201);

        const organizationId = organizationResponse.body.organization.id;

        // Create project
        const projectResponse = await request(app)
            .post(`/api/organizations/${organizationId}/projects`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            name: "Assignment Security Project",
            description: "Testing assignment authorization",
            });

        expect(projectResponse.status).toBe(201);

        const projectId = projectResponse.body.project.id;

        // Create task
        const taskResponse = await request(app)
            .post(`/api/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            title: "Assignment Security Task",
            description: "Testing invalid task assignment",
            priority: "MEDIUM",
            });

        expect(taskResponse.status).toBe(201);

        const taskId = taskResponse.body.task.id;

        // Try to assign task to non-member
        const updateResponse = await request(app)
            .patch(`/api/tasks/${taskId}`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            assigneeId: outsiderId,
            });

        expect(updateResponse.status).toBe(403);
    });

    it("should unassign an existing task", async () => {
        const email = `unassign-${Date.now()}@example.com`;
        const password = "password123";

        // Register
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Unassign Test User",
            email,
            password,
            });

        // Login
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
            email,
            password,
            });

        expect(loginResponse.status).toBe(200);

        const token = loginResponse.body.token;

        // Create organization
        const organizationResponse = await request(app)
            .post("/api/organizations")
            .set("Authorization", `Bearer ${token}`)
            .send({
            name: `Unassign Organization ${Date.now()}`,
            description: "Testing task unassignment",
            });

        expect(organizationResponse.status).toBe(201);

        const organizationId = organizationResponse.body.organization.id;

        // Create project
        const projectResponse = await request(app)
            .post(`/api/organizations/${organizationId}/projects`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            name: "Unassign Project",
            description: "Testing task unassignment",
            });

        expect(projectResponse.status).toBe(201);

        const projectId = projectResponse.body.project.id;

        // Create task assigned to the current user
        const taskResponse = await request(app)
            .post(`/api/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            title: "Unassign Test Task",
            description: "Testing task unassignment",
            priority: "MEDIUM",
            assigneeId: loginResponse.body.user.id,
            });

        expect(taskResponse.status).toBe(201);

        const taskId = taskResponse.body.task.id;

        // Unassign task
        const updateResponse = await request(app)
            .patch(`/api/tasks/${taskId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            assigneeId: null,
            });

        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.status).toBe("success");
        expect(updateResponse.body.task.assigneeId).toBeNull();
    });

    it("should update only the task status", async () => {
        const email = `status-only-${Date.now()}@example.com`;
        const password = "password123";

        // Register
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Status Test User",
            email,
            password,
            });

        // Login
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
            email,
            password,
            });

        expect(loginResponse.status).toBe(200);

        const token = loginResponse.body.token;
        const userId = loginResponse.body.user.id;

        // Create organization
        const organizationResponse = await request(app)
            .post("/api/organizations")
            .set("Authorization", `Bearer ${token}`)
            .send({
            name: `Status Organization ${Date.now()}`,
            description: "Testing status updates",
            });

        expect(organizationResponse.status).toBe(201);

        const organizationId = organizationResponse.body.organization.id;

        // Create project
        const projectResponse = await request(app)
            .post(`/api/organizations/${organizationId}/projects`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            name: "Status Project",
            description: "Testing status updates",
            });

        expect(projectResponse.status).toBe(201);

        const projectId = projectResponse.body.project.id;

        // Create task
        const taskResponse = await request(app)
            .post(`/api/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            title: "Status Test Task",
            description: "Status update test",
            priority: "LOW",
            assigneeId: userId,
            });

        expect(taskResponse.status).toBe(201);

        const taskId = taskResponse.body.task.id;

        // Update only status
        const updateResponse = await request(app)
            .patch(`/api/tasks/${taskId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            status: "DONE",
            });

        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.status).toBe("success");
        expect(updateResponse.body.task.status).toBe("DONE");
        expect(updateResponse.body.task.title).toBe("Status Test Task");
        expect(updateResponse.body.task.priority).toBe("LOW");
    });

    it("should update only the task priority", async () => {
        const email = `priority-only-${Date.now()}@example.com`;
        const password = "password123";

        // Register
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Priority Test User",
            email,
            password,
            });

        // Login
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
            email,
            password,
            });

        expect(loginResponse.status).toBe(200);

        const token = loginResponse.body.token;

        // Create organization
        const organizationResponse = await request(app)
            .post("/api/organizations")
            .set("Authorization", `Bearer ${token}`)
            .send({
            name: `Priority Organization ${Date.now()}`,
            description: "Testing priority updates",
            });

        expect(organizationResponse.status).toBe(201);

        const organizationId = organizationResponse.body.organization.id;

        // Create project
        const projectResponse = await request(app)
            .post(`/api/organizations/${organizationId}/projects`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            name: "Priority Project",
            description: "Testing priority updates",
            });

        expect(projectResponse.status).toBe(201);

        const projectId = projectResponse.body.project.id;

        // Create task
        const taskResponse = await request(app)
            .post(`/api/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            title: "Priority Test Task",
            description: "Priority update test",
            priority: "LOW",
            });

        expect(taskResponse.status).toBe(201);

        const taskId = taskResponse.body.task.id;

        // Update only priority
        const updateResponse = await request(app)
            .patch(`/api/tasks/${taskId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            priority: "URGENT",
            });

        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.status).toBe("success");
        expect(updateResponse.body.task.priority).toBe("URGENT");
        expect(updateResponse.body.task.title).toBe("Priority Test Task");
        expect(updateResponse.body.task.description).toBe("Priority update test");
    });

    it("should update only the task due date", async () => {
        const email = `duedate-only-${Date.now()}@example.com`;
        const password = "password123";

        // Register
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Due Date Test User",
            email,
            password,
            });

        // Login
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
            email,
            password,
            });

        expect(loginResponse.status).toBe(200);

        const token = loginResponse.body.token;

        // Create organization
        const organizationResponse = await request(app)
            .post("/api/organizations")
            .set("Authorization", `Bearer ${token}`)
            .send({
            name: `Due Date Organization ${Date.now()}`,
            description: "Testing due date updates",
            });

        expect(organizationResponse.status).toBe(201);

        const organizationId = organizationResponse.body.organization.id;

        // Create project
        const projectResponse = await request(app)
            .post(`/api/organizations/${organizationId}/projects`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            name: "Due Date Project",
            description: "Testing due date updates",
            });

        expect(projectResponse.status).toBe(201);

        const projectId = projectResponse.body.project.id;

        // Create task
        const taskResponse = await request(app)
            .post(`/api/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            title: "Due Date Test Task",
            description: "Due date update test",
            priority: "MEDIUM",
            });

        expect(taskResponse.status).toBe(201);

        const taskId = taskResponse.body.task.id;

        // Update only due date
        const dueDate = "2026-12-31T23:59:59.000Z";

        const updateResponse = await request(app)
            .patch(`/api/tasks/${taskId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            dueDate,
            });

        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.status).toBe("success");
        expect(updateResponse.body.task.title).toBe("Due Date Test Task");
        expect(updateResponse.body.task.description).toBe("Due date update test");
        expect(updateResponse.body.task.priority).toBe("MEDIUM");

        expect(
            new Date(updateResponse.body.task.dueDate).toISOString()
        ).toBe(dueDate);
    });
});