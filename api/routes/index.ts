import { Router } from 'express';
import { login, getCurrentUser } from '../controllers/authController.js';
import { getStats } from '../controllers/dashboardController.js';
import * as inspectionRequestController from '../controllers/inspectionRequestController.js';
import * as sampleController from '../controllers/sampleController.js';
import * as inspectionTaskController from '../controllers/inspectionTaskController.js';
import * as inspectionResultController from '../controllers/inspectionResultController.js';
import * as materialController from '../controllers/materialController.js';
import * as instrumentController from '../controllers/instrumentController.js';
import * as methodController from '../controllers/methodController.js';
import * as userController from '../controllers/userController.js';
import * as roleController from '../controllers/roleController.js';
import * as stabilityController from '../controllers/stabilityController.js';
import * as environmentController from '../controllers/environmentController.js';
import * as deviationController from '../controllers/deviationController.js';
import * as logController from '../controllers/logController.js';
import * as dataReviewController from '../controllers/dataReviewController.js';
import * as reportController from '../controllers/reportController.js';
import * as notificationController from '../controllers/notificationController.js';
import * as supplierController from '../controllers/supplierController.js';
import * as referenceMaterialController from '../controllers/referenceMaterialController.js';
import * as samplingController from '../controllers/samplingController.js';
import * as electronicSignatureController from '../controllers/electronicSignatureController.js';
import * as qualityControlController from '../controllers/qualityControlController.js';
import * as workflowController from '../controllers/workflowController.js';
import * as personnelController from '../controllers/personnelController.js';
import * as reagentConsumableController from '../controllers/reagent_consumable_controller.js';
import * as documentController from '../controllers/documentController.js';
import * as proficiencyTestingController from '../controllers/proficiencyTestingController.js';
import * as intermediateCheckController from '../controllers/intermediateCheckController.js';
import * as statisticsController from '../controllers/statisticsController.js';
import * as validationController from '../controllers/validationController.js';
import * as storageLocationController from '../controllers/storageLocationController.js';
import * as cultureMediaController from '../controllers/cultureMediaController.js';
import { authMiddleware } from '../middleware/auth.js';
import { logMiddleware } from '../middleware/log.js';

const router = Router();

// 认证路由
router.post('/auth/login', login);
router.get('/auth/me', authMiddleware, getCurrentUser);

// 仪表盘
router.get('/dashboard/stats', authMiddleware, getStats);

// 请验单
router.get('/inspection-requests', authMiddleware, inspectionRequestController.getList);
router.get('/inspection-requests/:id', authMiddleware, inspectionRequestController.getById);
router.post('/inspection-requests', authMiddleware, logMiddleware('请验单'), inspectionRequestController.create);
router.put('/inspection-requests/:id', authMiddleware, logMiddleware('请验单'), inspectionRequestController.update);
router.delete('/inspection-requests/:id', authMiddleware, logMiddleware('请验单'), inspectionRequestController.remove);

// 样品
router.get('/samples', authMiddleware, sampleController.getList);
router.get('/samples/:id', authMiddleware, sampleController.getById);
router.post('/samples', authMiddleware, logMiddleware('样品'), sampleController.create);
router.put('/samples/:id', authMiddleware, logMiddleware('样品'), sampleController.update);
router.delete('/samples/:id', authMiddleware, logMiddleware('样品'), sampleController.remove);

// 检验任务
router.get('/inspection-tasks', authMiddleware, inspectionTaskController.getList);
router.get('/inspection-tasks/:id', authMiddleware, inspectionTaskController.getById);
router.post('/inspection-tasks', authMiddleware, logMiddleware('检验任务'), inspectionTaskController.create);
router.put('/inspection-tasks/:id', authMiddleware, logMiddleware('检验任务'), inspectionTaskController.update);
router.put('/inspection-tasks/:id/status', authMiddleware, logMiddleware('检验任务'), inspectionTaskController.updateStatus);
router.delete('/inspection-tasks/:id', authMiddleware, logMiddleware('检验任务'), inspectionTaskController.remove);

// 检验结果
router.get('/inspection-results', authMiddleware, inspectionResultController.getList);
router.get('/inspection-results/:id', authMiddleware, inspectionResultController.getById);
router.post('/inspection-results', authMiddleware, logMiddleware('检验结果'), inspectionResultController.create);
router.put('/inspection-results/:id', authMiddleware, logMiddleware('检验结果'), inspectionResultController.update);
router.delete('/inspection-results/:id', authMiddleware, logMiddleware('检验结果'), inspectionResultController.remove);

// 物料
router.get('/materials', authMiddleware, materialController.getList);
router.get('/materials/:id', authMiddleware, materialController.getById);
router.post('/materials', authMiddleware, logMiddleware('物料'), materialController.create);
router.put('/materials/:id', authMiddleware, logMiddleware('物料'), materialController.update);
router.delete('/materials/:id', authMiddleware, logMiddleware('物料'), materialController.remove);

// 仪器
router.get('/instruments', authMiddleware, instrumentController.getList);
router.get('/instruments/:id', authMiddleware, instrumentController.getById);
router.post('/instruments', authMiddleware, logMiddleware('仪器'), instrumentController.create);
router.put('/instruments/:id', authMiddleware, logMiddleware('仪器'), instrumentController.update);
router.delete('/instruments/:id', authMiddleware, logMiddleware('仪器'), instrumentController.remove);

// 方法
router.get('/methods', authMiddleware, methodController.getList);
router.get('/methods/:id', authMiddleware, methodController.getById);
router.post('/methods', authMiddleware, logMiddleware('方法'), methodController.create);
router.put('/methods/:id', authMiddleware, logMiddleware('方法'), methodController.update);
router.delete('/methods/:id', authMiddleware, logMiddleware('方法'), methodController.remove);

// 用户
router.get('/users', authMiddleware, userController.getList);
router.get('/users/:id', authMiddleware, userController.getById);
router.post('/users', authMiddleware, logMiddleware('用户'), userController.create);
router.put('/users/:id', authMiddleware, logMiddleware('用户'), userController.update);
router.post('/users/:id/reset-password', authMiddleware, logMiddleware('用户'), userController.resetPassword);
router.delete('/users/:id', authMiddleware, logMiddleware('用户'), userController.remove);

// 角色
router.get('/roles', authMiddleware, roleController.getList);
router.get('/roles/:id', authMiddleware, roleController.getById);
router.post('/roles', authMiddleware, logMiddleware('角色'), roleController.create);
router.put('/roles/:id', authMiddleware, logMiddleware('角色'), roleController.update);
router.put('/roles/:id/permissions', authMiddleware, logMiddleware('角色'), roleController.updatePermissions);
router.delete('/roles/:id', authMiddleware, logMiddleware('角色'), roleController.remove);

// 稳定性方案
router.get('/stability-protocols', authMiddleware, stabilityController.getList);
router.get('/stability-protocols/:id', authMiddleware, stabilityController.getById);
router.post('/stability-protocols', authMiddleware, logMiddleware('稳定性方案'), stabilityController.create);
router.put('/stability-protocols/:id', authMiddleware, logMiddleware('稳定性方案'), stabilityController.update);
router.delete('/stability-protocols/:id', authMiddleware, logMiddleware('稳定性方案'), stabilityController.remove);

// 环境监测计划
router.get('/environment-plans', authMiddleware, environmentController.getPlans);
router.get('/environment-plans/:id', authMiddleware, environmentController.getPlanById);
router.post('/environment-plans', authMiddleware, logMiddleware('环境监测计划'), environmentController.createPlan);
router.put('/environment-plans/:id', authMiddleware, logMiddleware('环境监测计划'), environmentController.updatePlan);
router.delete('/environment-plans/:id', authMiddleware, logMiddleware('环境监测计划'), environmentController.deletePlan);

// 环境样品
router.get('/environment-samples', authMiddleware, environmentController.getSamples);
router.get('/environment-samples/:id', authMiddleware, environmentController.getSampleById);
router.post('/environment-samples', authMiddleware, logMiddleware('环境样品'), environmentController.createSample);
router.put('/environment-samples/:id', authMiddleware, logMiddleware('环境样品'), environmentController.updateSample);
router.delete('/environment-samples/:id', authMiddleware, logMiddleware('环境样品'), environmentController.deleteSample);

// 偏差调查
router.get('/deviations', authMiddleware, deviationController.getList);
router.get('/deviations/:id', authMiddleware, deviationController.getById);
router.post('/deviations', authMiddleware, logMiddleware('偏差调查'), deviationController.create);
router.put('/deviations/:id', authMiddleware, logMiddleware('偏差调查'), deviationController.update);
router.put('/deviations/:id/status', authMiddleware, logMiddleware('偏差调查'), deviationController.updateStatus);
router.delete('/deviations/:id', authMiddleware, logMiddleware('偏差调查'), deviationController.remove);

// 系统日志
router.get('/logs', authMiddleware, logController.getLogs);
router.get('/logs/stats', authMiddleware, logController.getStats);
router.get('/logs/:id', authMiddleware, logController.getLogById);
router.post('/logs', authMiddleware, logController.createLog);

// 数据复核
router.get('/data-reviews/pending', authMiddleware, dataReviewController.getPendingReviews);
router.get('/data-reviews/history/:id', authMiddleware, dataReviewController.getReviewHistory);
router.post('/data-reviews', authMiddleware, logMiddleware('数据复核'), dataReviewController.createReview);
router.put('/data-reviews/:id/execute', authMiddleware, logMiddleware('数据复核'), dataReviewController.executeReview);
router.put('/inspection-results/:id/approve', authMiddleware, logMiddleware('数据复核'), dataReviewController.approveResult);

// 检验报告
router.get('/reports', authMiddleware, reportController.getList);
router.get('/reports/:id', authMiddleware, reportController.getById);
router.get('/reports/generate', authMiddleware, logMiddleware('检验报告'), reportController.generateReportContent);
router.post('/reports', authMiddleware, logMiddleware('检验报告'), reportController.create);
router.put('/reports/:id', authMiddleware, logMiddleware('检验报告'), reportController.update);
router.post('/reports/:id/approve', authMiddleware, logMiddleware('检验报告'), reportController.approve);
router.delete('/reports/:id', authMiddleware, logMiddleware('检验报告'), reportController.remove);

// 通知
router.get('/notifications', authMiddleware, notificationController.getMyNotifications);
router.get('/notifications/unread-count', authMiddleware, notificationController.getUnreadCount);
router.put('/notifications/:id/read', authMiddleware, notificationController.markAsRead);
router.put('/notifications/read-all', authMiddleware, notificationController.markAllAsRead);
router.delete('/notifications/:id', authMiddleware, notificationController.remove);
router.post('/notifications/cleanup', authMiddleware, notificationController.cleanupOldNotifications);

// 供应商管理
router.get('/suppliers', authMiddleware, supplierController.getList);
router.get('/suppliers/:id', authMiddleware, supplierController.getById);
router.post('/suppliers', authMiddleware, logMiddleware('供应商'), supplierController.create);
router.put('/suppliers/:id', authMiddleware, logMiddleware('供应商'), supplierController.update);
router.delete('/suppliers/:id', authMiddleware, logMiddleware('供应商'), supplierController.remove);
router.post('/suppliers/:supplier_id/qualifications', authMiddleware, logMiddleware('供应商资质'), supplierController.addQualification);
router.delete('/suppliers/qualifications/:id', authMiddleware, logMiddleware('供应商资质'), supplierController.removeQualification);
router.post('/suppliers/:supplier_id/evaluations', authMiddleware, logMiddleware('供应商评价'), supplierController.addEvaluation);
router.delete('/suppliers/evaluations/:id', authMiddleware, logMiddleware('供应商评价'), supplierController.removeEvaluation);

// 标准物质管理
router.get('/reference-materials', authMiddleware, referenceMaterialController.getList);
router.get('/reference-materials/:id', authMiddleware, referenceMaterialController.getById);
router.post('/reference-materials', authMiddleware, logMiddleware('标准物质'), referenceMaterialController.create);
router.put('/reference-materials/:id', authMiddleware, logMiddleware('标准物质'), referenceMaterialController.update);
router.delete('/reference-materials/:id', authMiddleware, logMiddleware('标准物质'), referenceMaterialController.remove);
router.post('/reference-materials/:rm_id/checks', authMiddleware, logMiddleware('标准物质核查'), referenceMaterialController.addCheck);
router.get('/solutions', authMiddleware, referenceMaterialController.getSolutions);
router.post('/solutions', authMiddleware, logMiddleware('标准溶液'), referenceMaterialController.createSolution);
router.delete('/solutions/:id', authMiddleware, logMiddleware('标准溶液'), referenceMaterialController.removeSolution);

// 取样管理
router.get('/sampling-records', authMiddleware, samplingController.getList);
router.get('/sampling-records/:id', authMiddleware, samplingController.getById);
router.post('/sampling-records', authMiddleware, logMiddleware('取样记录'), samplingController.create);
router.put('/sampling-records/:id', authMiddleware, logMiddleware('取样记录'), samplingController.update);
router.delete('/sampling-records/:id', authMiddleware, logMiddleware('取样记录'), samplingController.remove);
router.post('/sampling-records/:id/sampling', authMiddleware, logMiddleware('执行取样'), samplingController.recordSampling);
router.post('/sampling-records/:id/handover', authMiddleware, logMiddleware('样品交接'), samplingController.recordHandover);
router.put('/sampling-records/handover/:handoverId/confirm', authMiddleware, logMiddleware('交接确认'), samplingController.confirmHandover);
router.post('/sampling-records/:id/print-label', authMiddleware, logMiddleware('标签打印'), samplingController.printLabel);

// 电子签名
router.get('/signatures/config', authMiddleware, electronicSignatureController.getSignatureConfig);
router.post('/signatures/setup', authMiddleware, logMiddleware('电子签名'), electronicSignatureController.setupSignature);
router.put('/signatures/update', authMiddleware, logMiddleware('电子签名'), electronicSignatureController.updateSignature);
router.post('/signatures/create', authMiddleware, logMiddleware('电子签名'), electronicSignatureController.createSignature);
router.get('/signatures/verify/:signatureRecordId', authMiddleware, electronicSignatureController.verifySignature);
router.get('/signatures/history', authMiddleware, electronicSignatureController.getSignatureHistory);
router.post('/signatures/revoke/:signatureRecordId', authMiddleware, logMiddleware('电子签名'), electronicSignatureController.revokeSignature);

// 质量控制
router.get('/qc-plans', authMiddleware, qualityControlController.getQCPlans);
router.get('/qc-plans/:id', authMiddleware, qualityControlController.getQCPlanById);
router.post('/qc-plans', authMiddleware, logMiddleware('质控计划'), qualityControlController.createQCPlan);
router.put('/qc-plans/:id', authMiddleware, logMiddleware('质控计划'), qualityControlController.updateQCPlan);
router.delete('/qc-plans/:id', authMiddleware, logMiddleware('质控计划'), qualityControlController.deleteQCPlan);

router.get('/qc-data', authMiddleware, qualityControlController.getQCData);
router.post('/qc-data', authMiddleware, logMiddleware('质控数据'), qualityControlController.createQCData);
router.put('/qc-data/:id', authMiddleware, logMiddleware('质控数据'), qualityControlController.updateQCData);

router.get('/qc-ooc-records', authMiddleware, qualityControlController.getQCOOCRecords);
router.post('/qc-ooc-records', authMiddleware, logMiddleware('失控记录'), qualityControlController.createQCOOC);
router.put('/qc-ooc-records/:id', authMiddleware, logMiddleware('失控记录'), qualityControlController.updateQCOOC);

// 工作流管理
router.get('/workflows', authMiddleware, workflowController.getWorkflows);
router.get('/workflows/:id', authMiddleware, workflowController.getWorkflowById);
router.post('/workflows', authMiddleware, logMiddleware('工作流'), workflowController.createWorkflow);
router.put('/workflows/:id', authMiddleware, logMiddleware('工作流'), workflowController.updateWorkflow);
router.delete('/workflows/:id', authMiddleware, logMiddleware('工作流'), workflowController.deleteWorkflow);

router.get('/workflow-instances', authMiddleware, workflowController.getWorkflowInstances);
router.post('/workflow-instances', authMiddleware, logMiddleware('工作流'), workflowController.startWorkflow);
router.put('/workflow-instances/:id/action', authMiddleware, logMiddleware('工作流'), workflowController.executeWorkflowAction);
router.put('/workflow-instances/:id/cancel', authMiddleware, logMiddleware('工作流'), workflowController.cancelWorkflow);
router.get('/workflow-history', authMiddleware, workflowController.getWorkflowHistory);

router.get('/approval-configs', authMiddleware, workflowController.getApprovalConfigs);
router.put('/approval-configs', authMiddleware, logMiddleware('审批配置'), workflowController.updateApprovalConfig);

// 人员管理
router.get('/personnel', authMiddleware, personnelController.getPersonnelList);
router.get('/personnel/:id', authMiddleware, personnelController.getPersonnelById);
router.post('/personnel', authMiddleware, logMiddleware('人员管理'), personnelController.createPersonnel);
router.put('/personnel/:id', authMiddleware, logMiddleware('人员管理'), personnelController.updatePersonnel);
router.delete('/personnel/:id', authMiddleware, logMiddleware('人员管理'), personnelController.deletePersonnel);

router.post('/personnel/:personnel_id/trainings', authMiddleware, logMiddleware('培训记录'), personnelController.addTraining);
router.put('/personnel/trainings/:id', authMiddleware, logMiddleware('培训记录'), personnelController.updateTraining);
router.delete('/personnel/trainings/:id', authMiddleware, logMiddleware('培训记录'), personnelController.deleteTraining);

router.post('/personnel/:personnel_id/qualifications', authMiddleware, logMiddleware('上岗证管理'), personnelController.addQualification);
router.put('/personnel/qualifications/:id', authMiddleware, logMiddleware('上岗证管理'), personnelController.updateQualification);
router.delete('/personnel/qualifications/:id', authMiddleware, logMiddleware('上岗证管理'), personnelController.deleteQualification);

router.get('/personnel/expiring-soon', authMiddleware, personnelController.getExpiringSoon);

// 试剂耗材管理
router.get('/reagent-consumables', authMiddleware, reagentConsumableController.getReagentList);
router.get('/reagent-consumables/:id', authMiddleware, reagentConsumableController.getReagentById);
router.post('/reagent-consumables', authMiddleware, logMiddleware('试剂耗材'), reagentConsumableController.createReagent);
router.put('/reagent-consumables/:id', authMiddleware, logMiddleware('试剂耗材'), reagentConsumableController.updateReagent);
router.delete('/reagent-consumables/:id', authMiddleware, logMiddleware('试剂耗材'), reagentConsumableController.deleteReagent);

router.post('/reagent-consumables/:reagent_id/in', authMiddleware, logMiddleware('试剂入库'), reagentConsumableController.addReagentIn);
router.post('/reagent-consumables/:reagent_id/out', authMiddleware, logMiddleware('试剂领用'), reagentConsumableController.addReagentOut);
router.put('/reagent-out-records/:id/confirm', authMiddleware, logMiddleware('确认领用'), reagentConsumableController.confirmReagentOut);
router.post('/reagent-consumables/:reagent_id/return', authMiddleware, logMiddleware('试剂归还'), reagentConsumableController.addReagentReturn);

router.get('/solutions', authMiddleware, reagentConsumableController.getSolutionList);
router.post('/solutions', authMiddleware, logMiddleware('溶液配制'), reagentConsumableController.createSolution);

router.get('/reagent-alerts', authMiddleware, reagentConsumableController.getAlerts);

// 文件管理
router.get('/document-categories', authMiddleware, documentController.getDocumentCategories);
router.post('/document-categories', authMiddleware, logMiddleware('文件分类'), documentController.createDocumentCategory);

router.get('/documents', authMiddleware, documentController.getDocuments);
router.get('/documents/:id', authMiddleware, documentController.getDocumentById);
router.post('/documents', authMiddleware, logMiddleware('文件管理'), documentController.createDocument);
router.put('/documents/:id', authMiddleware, logMiddleware('文件管理'), documentController.updateDocument);
router.post('/documents/:id/review', authMiddleware, logMiddleware('文件审核'), documentController.reviewDocument);
router.post('/documents/:id/approve', authMiddleware, logMiddleware('文件批准'), documentController.approveDocument);

router.post('/document-distributions', authMiddleware, logMiddleware('文件发放'), documentController.distributeDocument);
router.put('/document-distributions/:id/return', authMiddleware, logMiddleware('文件回收'), documentController.returnDocument);

router.post('/document-changes', authMiddleware, logMiddleware('文件变更'), documentController.createDocumentChange);
router.put('/document-changes/:id/review', authMiddleware, logMiddleware('变更审核'), documentController.reviewDocumentChange);

router.post('/document-read-records', authMiddleware, documentController.recordDocumentRead);

// 能力验证管理
router.get('/proficiency-testing-plans', authMiddleware, proficiencyTestingController.getProficiencyTestingPlans);
router.get('/proficiency-testing-plans/:id', authMiddleware, proficiencyTestingController.getProficiencyTestingPlanById);
router.post('/proficiency-testing-plans', authMiddleware, logMiddleware('能力验证计划'), proficiencyTestingController.createProficiencyTestingPlan);
router.put('/proficiency-testing-plans/:id', authMiddleware, logMiddleware('能力验证计划'), proficiencyTestingController.updateProficiencyTestingPlan);

router.post('/proficiency-testing-results', authMiddleware, logMiddleware('能力验证结果'), proficiencyTestingController.addProficiencyTestingResult);
router.put('/proficiency-testing-results/:id/review', authMiddleware, logMiddleware('结果审核'), proficiencyTestingController.reviewProficiencyTestingResult);

router.post('/proficiency-unsatisfactory-actions', authMiddleware, logMiddleware('不满意处理'), proficiencyTestingController.addUnsatisfactoryAction);
router.put('/proficiency-unsatisfactory-actions/:id', authMiddleware, logMiddleware('不满意处理'), proficiencyTestingController.updateUnsatisfactoryAction);

router.get('/proficiency-testing-stats', authMiddleware, proficiencyTestingController.getProficiencyTestingStats);

// 期间核查管理
router.get('/intermediate-check-plans', authMiddleware, intermediateCheckController.getIntermediateCheckPlans);
router.get('/intermediate-check-plans/:id', authMiddleware, intermediateCheckController.getIntermediateCheckPlanById);
router.post('/intermediate-check-plans', authMiddleware, logMiddleware('期间核查计划'), intermediateCheckController.createIntermediateCheckPlan);
router.put('/intermediate-check-plans/:id', authMiddleware, logMiddleware('期间核查计划'), intermediateCheckController.updateIntermediateCheckPlan);

router.post('/intermediate-check-records', authMiddleware, logMiddleware('期间核查记录'), intermediateCheckController.addIntermediateCheckRecord);
router.put('/intermediate-check-records/:id/review', authMiddleware, logMiddleware('核查审核'), intermediateCheckController.reviewIntermediateCheckRecord);

router.get('/intermediate-check-alerts', authMiddleware, intermediateCheckController.getIntermediateCheckAlerts);
router.put('/intermediate-check-alerts/:id/resolve', authMiddleware, logMiddleware('预警处理'), intermediateCheckController.resolveIntermediateCheckAlert);

router.get('/intermediate-check-stats', authMiddleware, intermediateCheckController.getIntermediateCheckStats);

// 查询统计与报表管理
router.get('/report-templates', authMiddleware, statisticsController.getReportTemplates);
router.get('/report-templates/:id', authMiddleware, statisticsController.getReportTemplateById);
router.post('/reports/generate', authMiddleware, logMiddleware('报表生成'), statisticsController.generateReport);
router.get('/report-instances', authMiddleware, statisticsController.getReportInstances);

router.get('/statistics-configs', authMiddleware, statisticsController.getStatisticsConfigs);
router.post('/statistics/calculate', authMiddleware, logMiddleware('统计计算'), statisticsController.calculateStatistics);
router.get('/statistics/categories', authMiddleware, statisticsController.getStatisticsCategories);

router.get('/dashboard/statistics', authMiddleware, statisticsController.getDashboardStatistics);

// 验证管理
router.get('/validation-plans', authMiddleware, validationController.getValidationPlans);
router.get('/validation-plans/:id', authMiddleware, validationController.getValidationPlanById);
router.post('/validation-plans', authMiddleware, logMiddleware('验证计划'), validationController.createValidationPlan);
router.put('/validation-plans/:id', authMiddleware, logMiddleware('验证计划'), validationController.updateValidationPlan);

router.post('/validation-documents', authMiddleware, logMiddleware('验证文档'), validationController.addValidationDocument);
router.put('/validation-documents/:id/review', authMiddleware, logMiddleware('验证文档审核'), validationController.reviewValidationDocument);
router.put('/validation-documents/:id/approve', authMiddleware, logMiddleware('验证文档批准'), validationController.approveValidationDocument);

router.post('/validation-tests', authMiddleware, logMiddleware('验证测试'), validationController.addValidationTest);
router.put('/validation-tests/:id/review', authMiddleware, logMiddleware('验证测试审核'), validationController.reviewValidationTest);

router.post('/traceability-matrices', authMiddleware, logMiddleware('可追溯性矩阵'), validationController.addTraceabilityMatrix);

router.post('/validation-deviations', authMiddleware, logMiddleware('验证偏差'), validationController.addValidationDeviation);
router.put('/validation-deviations/:id', authMiddleware, logMiddleware('验证偏差'), validationController.updateValidationDeviation);

router.get('/validation-stats', authMiddleware, validationController.getValidationStats);

// 存样地点管理
router.get('/storage-locations', authMiddleware, storageLocationController.getList);
router.get('/storage-locations/rooms', authMiddleware, storageLocationController.getRooms);
router.get('/storage-locations/stats', authMiddleware, storageLocationController.getStats);
router.get('/storage-locations/:id', authMiddleware, storageLocationController.getById);
router.post('/storage-locations', authMiddleware, logMiddleware('存样地点'), storageLocationController.create);
router.put('/storage-locations/:id', authMiddleware, logMiddleware('存样地点'), storageLocationController.update);
router.delete('/storage-locations/:id', authMiddleware, logMiddleware('存样地点'), storageLocationController.remove);

router.get('/storage-records', authMiddleware, storageLocationController.getStorageRecords);
router.post('/storage-records', authMiddleware, logMiddleware('样品入库'), storageLocationController.storeSample);
router.put('/storage-records/:id/retrieve', authMiddleware, logMiddleware('样品出库'), storageLocationController.retrieveSample);

// 培养基管理
router.get('/culture-media', authMiddleware, cultureMediaController.getCultureMediaList);
router.get('/culture-media/:id', authMiddleware, cultureMediaController.getCultureMediaById);
router.post('/culture-media', authMiddleware, logMiddleware('培养基'), cultureMediaController.createCultureMedia);
router.put('/culture-media/:id', authMiddleware, logMiddleware('培养基'), cultureMediaController.updateCultureMedia);
router.delete('/culture-media/:id', authMiddleware, logMiddleware('培养基'), cultureMediaController.deleteCultureMedia);

router.get('/media-acceptance-records', authMiddleware, cultureMediaController.getAcceptanceRecords);
router.get('/media-acceptance-records/:id', authMiddleware, cultureMediaController.getAcceptanceRecordById);
router.post('/media-acceptance-records', authMiddleware, logMiddleware('培养基验收'), cultureMediaController.createAcceptanceRecord);
router.put('/media-acceptance-records/:id', authMiddleware, logMiddleware('培养基验收'), cultureMediaController.updateAcceptanceRecord);
router.delete('/media-acceptance-records/:id', authMiddleware, logMiddleware('培养基验收'), cultureMediaController.deleteAcceptanceRecord);

router.get('/media-preparation-records', authMiddleware, cultureMediaController.getPreparationRecords);
router.get('/media-preparation-records/:id', authMiddleware, cultureMediaController.getPreparationRecordById);
router.post('/media-preparation-records', authMiddleware, logMiddleware('培养基配制'), cultureMediaController.createPreparationRecord);
router.put('/media-preparation-records/:id', authMiddleware, logMiddleware('培养基配制'), cultureMediaController.updatePreparationRecord);
router.delete('/media-preparation-records/:id', authMiddleware, logMiddleware('培养基配制'), cultureMediaController.deletePreparationRecord);
router.put('/media-preparation-records/:id/sterilize', authMiddleware, logMiddleware('灭菌确认'), cultureMediaController.confirmSterilization);

router.get('/media-pre-incubation-records', authMiddleware, cultureMediaController.getPreIncubationRecords);
router.get('/media-pre-incubation-records/:id', authMiddleware, cultureMediaController.getPreIncubationRecordById);
router.post('/media-pre-incubation-records', authMiddleware, logMiddleware('预培养'), cultureMediaController.createPreIncubationRecord);
router.put('/media-pre-incubation-records/:id', authMiddleware, logMiddleware('预培养'), cultureMediaController.updatePreIncubationRecord);
router.delete('/media-pre-incubation-records/:id', authMiddleware, logMiddleware('预培养'), cultureMediaController.deletePreIncubationRecord);
router.put('/media-pre-incubation-records/:id/sterility', authMiddleware, logMiddleware('无菌检查'), cultureMediaController.confirmSterilityResult);

router.get('/media-usage-records', authMiddleware, cultureMediaController.getUsageRecords);
router.get('/media-usage-records/:id', authMiddleware, cultureMediaController.getUsageRecordById);
router.post('/media-usage-records', authMiddleware, logMiddleware('培养基领用'), cultureMediaController.createUsageRecord);
router.put('/media-usage-records/:id', authMiddleware, logMiddleware('培养基领用'), cultureMediaController.updateUsageRecord);
router.delete('/media-usage-records/:id', authMiddleware, logMiddleware('培养基领用'), cultureMediaController.deleteUsageRecord);

router.get('/media-inactivation-records', authMiddleware, cultureMediaController.getInactivationRecords);
router.get('/media-inactivation-records/:id', authMiddleware, cultureMediaController.getInactivationRecordById);
router.post('/media-inactivation-records', authMiddleware, logMiddleware('培养基灭活'), cultureMediaController.createInactivationRecord);
router.put('/media-inactivation-records/:id', authMiddleware, logMiddleware('培养基灭活'), cultureMediaController.updateInactivationRecord);
router.delete('/media-inactivation-records/:id', authMiddleware, logMiddleware('培养基灭活'), cultureMediaController.deleteInactivationRecord);
router.put('/media-inactivation-records/:id/verify', authMiddleware, logMiddleware('灭活确认'), cultureMediaController.verifyInactivation);

export default router;
