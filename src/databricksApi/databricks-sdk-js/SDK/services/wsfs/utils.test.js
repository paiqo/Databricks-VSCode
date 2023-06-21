"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/naming-convention */
const assert_1 = __importDefault(require("assert"));
const ts_mockito_1 = require("ts-mockito");
const workspace_1 = require("../../apis/workspace");
const WorkspaceClient_1 = require("../../WorkspaceClient");
const utils_1 = require("./utils");
const WorkspaceFsEntity_1 = require("./WorkspaceFsEntity");
describe(__filename, () => {
    let mockWorkspaceClient;
    beforeEach(() => {
        mockWorkspaceClient = (0, ts_mockito_1.mock)(WorkspaceClient_1.WorkspaceClient);
        const mockWorkspaceService = (0, ts_mockito_1.mock)(workspace_1.WorkspaceService);
        (0, ts_mockito_1.when)(mockWorkspaceClient.workspace).thenReturn((0, ts_mockito_1.instance)(mockWorkspaceService));
        (0, ts_mockito_1.when)(mockWorkspaceService.getStatus((0, ts_mockito_1.deepEqual)({ path: "/file" }), (0, ts_mockito_1.anything)())).thenResolve({
            path: "/file",
            object_id: 12345,
            object_type: "FILE",
            language: "PYTHON",
        });
        (0, ts_mockito_1.when)(mockWorkspaceService.getStatus((0, ts_mockito_1.deepEqual)({ path: "/notebook" }), (0, ts_mockito_1.anything)())).thenResolve({
            path: "/notebook",
            object_id: 12345,
            object_type: "NOTEBOOK",
            language: "PYTHON",
        });
        (0, ts_mockito_1.when)(mockWorkspaceService.getStatus((0, ts_mockito_1.deepEqual)({ path: "/dir" }), (0, ts_mockito_1.anything)())).thenResolve({
            path: "/dir",
            object_id: 12345,
            object_type: "DIRECTORY",
        });
        (0, ts_mockito_1.when)(mockWorkspaceService.getStatus((0, ts_mockito_1.deepEqual)({ path: "/repo" }), (0, ts_mockito_1.anything)())).thenResolve({
            path: "/repo",
            object_id: 12345,
            object_type: "REPO",
        });
    });
    it("should type discriminate files", async () => {
        const file = await WorkspaceFsEntity_1.WorkspaceFsEntity.fromPath((0, ts_mockito_1.instance)(mockWorkspaceClient), "/file");
        assert_1.default.ok((0, utils_1.isFile)(file));
        assert_1.default.ok(!(0, utils_1.isNotebook)(file));
        assert_1.default.ok(!(0, utils_1.isDirectory)(file));
        assert_1.default.ok(!(0, utils_1.isRepo)(file));
    });
    it("should type discriminate notebook", async () => {
        const file = await WorkspaceFsEntity_1.WorkspaceFsEntity.fromPath((0, ts_mockito_1.instance)(mockWorkspaceClient), "/notebook");
        assert_1.default.ok((0, utils_1.isFile)(file));
        assert_1.default.ok((0, utils_1.isNotebook)(file));
        assert_1.default.ok(!(0, utils_1.isDirectory)(file));
        assert_1.default.ok(!(0, utils_1.isRepo)(file));
    });
    it("should type discriminate dir", async () => {
        const file = await WorkspaceFsEntity_1.WorkspaceFsEntity.fromPath((0, ts_mockito_1.instance)(mockWorkspaceClient), "/dir");
        assert_1.default.ok(!(0, utils_1.isFile)(file));
        assert_1.default.ok(!(0, utils_1.isNotebook)(file));
        assert_1.default.ok((0, utils_1.isDirectory)(file));
        assert_1.default.ok(!(0, utils_1.isRepo)(file));
    });
    it("should type discriminate repo", async () => {
        const file = await WorkspaceFsEntity_1.WorkspaceFsEntity.fromPath((0, ts_mockito_1.instance)(mockWorkspaceClient), "/repo");
        assert_1.default.ok(!(0, utils_1.isFile)(file));
        assert_1.default.ok(!(0, utils_1.isNotebook)(file));
        assert_1.default.ok((0, utils_1.isDirectory)(file));
        assert_1.default.ok((0, utils_1.isRepo)(file));
    });
});
//# sourceMappingURL=utils.test.js.map