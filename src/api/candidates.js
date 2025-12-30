import { apiPost } from './client';

export function uploadCv(token, { requirementId, filename, mimeType, base64 }) {
  return apiPost('FILE_UPLOAD_CV', { requirementId, filename, mimeType, base64 }, token);
}

export function candidateAdd(token, { requirementId, candidateName, mobile, source, cvFileId, cvFileName }) {
  return apiPost(
    'CANDIDATE_ADD',
    { requirementId, candidateName, mobile, source, cvFileId, cvFileName },
    token
  );
}

export function candidateBulkAdd(token, { requirementId, items }) {
  return apiPost('CANDIDATE_BULK_ADD', { requirementId, items }, token);
}

export function shortlistDecide(token, { requirementId, candidateId, decision, remark }) {
  return apiPost('SHORTLIST_DECIDE', { requirementId, candidateId, decision, remark }, token);
}

export function holdRevert(token, { requirementId, candidateId, remark }) {
  return apiPost('HOLD_REVERT', { requirementId, candidateId, remark }, token);
}

export function shortlistHoldRevert(token, { requirementId, candidateId, remark }) {
  return apiPost('SHORTLIST_HOLD_REVERT', { requirementId, candidateId, remark }, token);
}

export function ownerCandidatesList(token, { countOnly } = {}) {
  return apiPost('OWNER_CANDIDATES_LIST', { countOnly: !!countOnly }, token);
}

export function ownerDecide(token, { requirementId, candidateId, decision, remark, holdUntil }) {
  return apiPost('OWNER_DECIDE', { requirementId, candidateId, decision, remark, holdUntil }, token);
}

export function walkinSchedule(token, { requirementId, candidateId, candidateIds, walkinAt, notes }) {
  return apiPost('WALKIN_SCHEDULE', { requirementId, candidateId, candidateIds, walkinAt, notes }, token);
}

export function copyTemplateData(token) {
  return apiPost('COPY_TEMPLATE_DATA', {}, token);
}

export function precallList(token, { jobRole, date, countOnly } = {}) {
  return apiPost('PRECALL_LIST', { jobRole, date, countOnly: !!countOnly }, token);
}

export function precallUpdate(token, { requirementId, candidateId, op, remark, preCallAt } = {}) {
  return apiPost('PRECALL_UPDATE', { requirementId, candidateId, op, remark, preCallAt }, token);
}

export function autoRejectNotpick(token) {
  return apiPost('AUTO_REJECT_NOTPICK', {}, token);
}

export function inpersonPipelineList(token, { jobRole, countOnly } = {}) {
  return apiPost('INPERSON_PIPELINE_LIST', { jobRole, countOnly: !!countOnly }, token);
}

export function inpersonMarksSave(token, { requirementId, candidateId, marks } = {}) {
  return apiPost('INPERSON_MARKS_SAVE', { requirementId, candidateId, marks }, token);
}

export function techSelect(token, { requirementId, candidateId, tests } = {}) {
  return apiPost('TECH_SELECT', { requirementId, candidateId, tests }, token);
}

export function autoRejectInpersonLow(token) {
  return apiPost('AUTO_REJECT_INPERSON_LOW', {}, token);
}

export function techPendingList(token, { countOnly } = {}) {
  return apiPost('TECH_PENDING_LIST', { countOnly: !!countOnly }, token);
}

export function eaTechMarksSubmit(token, { requirementId, candidateId, tallyMarks, voiceMarks, review } = {}) {
  return apiPost('EA_TECH_MARKS_SUBMIT', { requirementId, candidateId, tallyMarks, voiceMarks, review }, token);
}

export function adminExcelMarksSubmit(token, { requirementId, candidateId, excelMarks, review } = {}) {
  return apiPost('ADMIN_EXCEL_MARKS_SUBMIT', { requirementId, candidateId, excelMarks, review }, token);
}

export function testFailDecide(token, { requirementId, candidateId, testType, decision, remark, stageTag, meta } = {}) {
  return apiPost('TEST_FAIL_DECIDE', { requirementId, candidateId, testType, decision, remark, stageTag, meta }, token);
}

export function passfailEvaluate(token, { requirementId, candidateId } = {}) {
  return apiPost('PASSFAIL_EVALUATE', { requirementId, candidateId }, token);
}

export function finalInterviewList(token, { countOnly } = {}) {
  return apiPost('FINAL_INTERVIEW_LIST', { countOnly: !!countOnly }, token);
}

export function finalSendOwner(token, { requirementId, candidateId } = {}) {
  return apiPost('FINAL_SEND_OWNER', { requirementId, candidateId }, token);
}

export function ownerFinalDecide(token, { requirementId, candidateId, decision, remark } = {}) {
  return apiPost('OWNER_FINAL_DECIDE', { requirementId, candidateId, decision, remark }, token);
}

export function hrFinalHoldList(token, { countOnly } = {}) {
  return apiPost('HR_FINAL_HOLD_LIST', { countOnly: !!countOnly }, token);
}

export function hrHoldSchedule(token, { requirementId, candidateId, finalHoldAt, remark } = {}) {
  return apiPost('HR_HOLD_SCHEDULE', { requirementId, candidateId, finalHoldAt, remark }, token);
}

export function autoRejectFinalNoshow(token) {
  return apiPost('AUTO_REJECT_FINAL_NOSHOW', {}, token);
}

export function joiningList(token, { countOnly } = {}) {
  return apiPost('JOINING_LIST', { countOnly: !!countOnly }, token);
}

export function joiningSetDate(token, { requirementId, candidateId, joiningAt } = {}) {
  return apiPost('JOINING_SET_DATE', { requirementId, candidateId, joiningAt }, token);
}

export function docsUpload(token, { requirementId, candidateId, docs } = {}) {
  return apiPost('DOCS_UPLOAD', { requirementId, candidateId, docs }, token);
}

export function docsComplete(token, { requirementId, candidateId } = {}) {
  return apiPost('DOCS_COMPLETE', { requirementId, candidateId }, token);
}

export function markJoin(token, { requirementId, candidateId, remark } = {}) {
  return apiPost('MARK_JOIN', { requirementId, candidateId, remark }, token);
}

export function rejectRevert(token, { requirementId, candidateId, remark } = {}) {
  return apiPost('REJECT_REVERT', { requirementId, candidateId, remark }, token);
}

export function preinterviewStatus(token, { requirementId, candidateId, op, remark, preInterviewAt } = {}) {
  return apiPost('PREINTERVIEW_STATUS', { requirementId, candidateId, op, remark, preInterviewAt }, token);
}

export function preinterviewMarksSave(token, { requirementId, candidateId, marks } = {}) {
  return apiPost('PREINTERVIEW_MARKS_SAVE', { requirementId, candidateId, marks }, token);
}

export function testLinkCreate(token, { requirementId, candidateId } = {}) {
  return apiPost('TEST_LINK_CREATE', { requirementId, candidateId }, token);
}

// Phase 21 - Probation + Employees
export function probationList(token, { countOnly } = {}) {
  return apiPost('PROBATION_LIST', { countOnly: !!countOnly }, token);
}

export function probationSet(token, { requirementId, candidateId, probationDays } = {}) {
  return apiPost('PROBATION_SET', { requirementId, candidateId, probationDays }, token);
}

export function probationDecide(token, { requirementId, candidateId, decision, remark } = {}) {
  return apiPost('PROBATION_DECIDE', { requirementId, candidateId, decision, remark }, token);
}

export function roleChange(token, { requirementId, candidateId, jobRole, remark } = {}) {
  return apiPost('ROLE_CHANGE', { requirementId, candidateId, jobRole, remark }, token);
}

export function employeeCreateFromCandidate(token, { requirementId, candidateId } = {}) {
  return apiPost('EMPLOYEE_CREATE_FROM_CANDIDATE', { requirementId, candidateId }, token);
}

export function employeeGet(token, { employeeId } = {}) {
  return apiPost('EMPLOYEE_GET', { employeeId }, token);
}

export function rejectionLogList(token) {
  return apiPost('REJECTION_LOG_LIST', {}, token);
}
