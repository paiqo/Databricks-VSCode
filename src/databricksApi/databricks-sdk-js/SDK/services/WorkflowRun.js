"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowRun = void 0;
const jobs_1 = require("../apis/jobs");
class WorkflowRun {
    constructor(client, details) {
        this.client = client;
        this.details = details;
    }
    static async fromId(client, runId) {
        const jobsService = new jobs_1.JobsService(client);
        return new WorkflowRun(client, await jobsService.getRun({ run_id: runId }));
    }
    get lifeCycleState() {
        return this.details.state?.life_cycle_state || "INTERNAL_ERROR";
    }
    get state() {
        return this.details.state;
    }
    get tasks() {
        return this.details.tasks;
    }
    get runPageUrl() {
        return this.details.run_page_url || "";
    }
    async cancel() {
        const jobsService = new jobs_1.JobsService(this.client);
        await jobsService.cancelRun({ run_id: this.details.run_id });
    }
    async update() {
        const jobsService = new jobs_1.JobsService(this.client);
        this.details = await jobsService.getRun({ run_id: this.details.run_id });
    }
    async getOutput(task) {
        task = task || this.tasks[0];
        if (!task) {
            throw new Error("Run has no tasks");
        }
        const jobsService = new jobs_1.JobsService(this.client);
        return jobsService.getRunOutput({ run_id: task.run_id });
    }
    async export(task) {
        task = task || this.tasks[0];
        if (this.lifeCycleState !== "TERMINATED" &&
            this.lifeCycleState !== "INTERNAL_ERROR") {
            throw new Error("Run is not terminated");
        }
        if (!this.tasks || !this.tasks.length) {
            throw new Error("Run has no tasks");
        }
        const jobsService = new jobs_1.JobsService(this.client);
        return await jobsService.exportRun({
            run_id: task.run_id,
        });
    }
}
exports.WorkflowRun = WorkflowRun;
//# sourceMappingURL=WorkflowRun.js.map