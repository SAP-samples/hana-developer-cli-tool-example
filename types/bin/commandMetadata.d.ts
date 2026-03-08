/**
 * Get metadata for a command
 * @param {string} commandName - The command name (including aliases)
 * @returns {Object|null} Metadata object or null if not found
 */
export function getCommandMetadata(commandName: string): Object | null;
/**
 * Get primary command name from alias
 * @param {string} commandOrAlias - The command or alias name
 * @returns {string} The canonical command name
 */
export function getPrimaryCommand(commandOrAlias: string): string;
export namespace commandMetadata {
    export namespace _import {
        let category: string;
        let relatedCommands: string[];
    }
    export { _import as import };
    export namespace imp {
        let category_1: string;
        export { category_1 as category };
        let relatedCommands_1: string[];
        export { relatedCommands_1 as relatedCommands };
    }
    export namespace uploadData {
        let category_2: string;
        export { category_2 as category };
        let relatedCommands_2: string[];
        export { relatedCommands_2 as relatedCommands };
    }
    export namespace uploaddata {
        let category_3: string;
        export { category_3 as category };
        let relatedCommands_3: string[];
        export { relatedCommands_3 as relatedCommands };
    }
    export namespace _export {
        let category_4: string;
        export { category_4 as category };
        let relatedCommands_4: string[];
        export { relatedCommands_4 as relatedCommands };
    }
    export { _export as export };
    export namespace exp {
        let category_5: string;
        export { category_5 as category };
        let relatedCommands_5: string[];
        export { relatedCommands_5 as relatedCommands };
    }
    export namespace downloadData {
        let category_6: string;
        export { category_6 as category };
        let relatedCommands_6: string[];
        export { relatedCommands_6 as relatedCommands };
    }
    export namespace downloaddata {
        let category_7: string;
        export { category_7 as category };
        let relatedCommands_7: string[];
        export { relatedCommands_7 as relatedCommands };
    }
    export namespace compareData {
        let category_8: string;
        export { category_8 as category };
        let relatedCommands_8: string[];
        export { relatedCommands_8 as relatedCommands };
    }
    export namespace compareSchema {
        let category_9: string;
        export { category_9 as category };
        let relatedCommands_9: string[];
        export { relatedCommands_9 as relatedCommands };
    }
    export namespace dataDiff {
        let category_10: string;
        export { category_10 as category };
        let relatedCommands_10: string[];
        export { relatedCommands_10 as relatedCommands };
    }
    export namespace dataValidator {
        let category_11: string;
        export { category_11 as category };
        let relatedCommands_11: string[];
        export { relatedCommands_11 as relatedCommands };
    }
    export namespace dataProfile {
        let category_12: string;
        export { category_12 as category };
        let relatedCommands_12: string[];
        export { relatedCommands_12 as relatedCommands };
    }
    export namespace dataSync {
        let category_13: string;
        export { category_13 as category };
        let relatedCommands_13: string[];
        export { relatedCommands_13 as relatedCommands };
    }
    export namespace duplicateDetection {
        let category_14: string;
        export { category_14 as category };
        let relatedCommands_14: string[];
        export { relatedCommands_14 as relatedCommands };
    }
    export namespace kafkaConnect {
        let category_15: string;
        export { category_15 as category };
        let relatedCommands_15: string[];
        export { relatedCommands_15 as relatedCommands };
    }
    export namespace dataLineage {
        let category_16: string;
        export { category_16 as category };
        let relatedCommands_16: string[];
        export { relatedCommands_16 as relatedCommands };
    }
    export namespace dataMask {
        let category_17: string;
        export { category_17 as category };
        let relatedCommands_17: string[];
        export { relatedCommands_17 as relatedCommands };
    }
    export namespace tables {
        let category_18: string;
        export { category_18 as category };
        let relatedCommands_18: string[];
        export { relatedCommands_18 as relatedCommands };
    }
    export namespace schemas {
        let category_19: string;
        export { category_19 as category };
        let relatedCommands_19: string[];
        export { relatedCommands_19 as relatedCommands };
    }
    export namespace schemaClone {
        let category_20: string;
        export { category_20 as category };
        let relatedCommands_20: string[];
        export { relatedCommands_20 as relatedCommands };
    }
    export namespace views {
        let category_21: string;
        export { category_21 as category };
        let relatedCommands_21: string[];
        export { relatedCommands_21 as relatedCommands };
    }
    export namespace procedures {
        let category_22: string;
        export { category_22 as category };
        let relatedCommands_22: string[];
        export { relatedCommands_22 as relatedCommands };
    }
    export namespace functions {
        let category_23: string;
        export { category_23 as category };
        let relatedCommands_23: string[];
        export { relatedCommands_23 as relatedCommands };
    }
    export namespace indexes {
        let category_24: string;
        export { category_24 as category };
        let relatedCommands_24: string[];
        export { relatedCommands_24 as relatedCommands };
    }
    export namespace objects {
        let category_25: string;
        export { category_25 as category };
        let relatedCommands_25: string[];
        export { relatedCommands_25 as relatedCommands };
    }
    export namespace sequences {
        let category_26: string;
        export { category_26 as category };
        let relatedCommands_26: string[];
        export { relatedCommands_26 as relatedCommands };
    }
    export namespace libraries {
        let category_27: string;
        export { category_27 as category };
        let relatedCommands_27: string[];
        export { relatedCommands_27 as relatedCommands };
    }
    export namespace synonyms {
        let category_28: string;
        export { category_28 as category };
        let relatedCommands_28: string[];
        export { relatedCommands_28 as relatedCommands };
    }
    export namespace triggers {
        let category_29: string;
        export { category_29 as category };
        let relatedCommands_29: string[];
        export { relatedCommands_29 as relatedCommands };
    }
    export namespace inspectTable {
        let category_30: string;
        export { category_30 as category };
        let relatedCommands_30: string[];
        export { relatedCommands_30 as relatedCommands };
    }
    export namespace inspectView {
        let category_31: string;
        export { category_31 as category };
        let relatedCommands_31: string[];
        export { relatedCommands_31 as relatedCommands };
    }
    export namespace inspectProcedure {
        let category_32: string;
        export { category_32 as category };
        let relatedCommands_32: string[];
        export { relatedCommands_32 as relatedCommands };
    }
    export namespace inspectFunction {
        let category_33: string;
        export { category_33 as category };
        let relatedCommands_33: string[];
        export { relatedCommands_33 as relatedCommands };
    }
    export namespace inspectIndex {
        let category_34: string;
        export { category_34 as category };
        let relatedCommands_34: string[];
        export { relatedCommands_34 as relatedCommands };
    }
    export namespace inspectJWT {
        let category_35: string;
        export { category_35 as category };
        let relatedCommands_35: string[];
        export { relatedCommands_35 as relatedCommands };
    }
    export namespace inspectLibrary {
        let category_36: string;
        export { category_36 as category };
        let relatedCommands_36: string[];
        export { relatedCommands_36 as relatedCommands };
    }
    export namespace inspectLibMember {
        let category_37: string;
        export { category_37 as category };
        let relatedCommands_37: string[];
        export { relatedCommands_37 as relatedCommands };
    }
    export namespace inspectTrigger {
        let category_38: string;
        export { category_38 as category };
        let relatedCommands_38: string[];
        export { relatedCommands_38 as relatedCommands };
    }
    export namespace inspectTableUI {
        let category_39: string;
        export { category_39 as category };
        let relatedCommands_39: string[];
        export { relatedCommands_39 as relatedCommands };
    }
    export namespace calcViewAnalyzer {
        let category_40: string;
        export { category_40 as category };
        let relatedCommands_40: string[];
        export { relatedCommands_40 as relatedCommands };
    }
    export namespace erdDiagram {
        let category_41: string;
        export { category_41 as category };
        let relatedCommands_41: string[];
        export { relatedCommands_41 as relatedCommands };
    }
    export namespace graphWorkspaces {
        let category_42: string;
        export { category_42 as category };
        let relatedCommands_42: string[];
        export { relatedCommands_42 as relatedCommands };
    }
    export namespace privilegeAnalysis {
        let category_43: string;
        export { category_43 as category };
        let relatedCommands_43: string[];
        export { relatedCommands_43 as relatedCommands };
    }
    export namespace grantChains {
        let category_44: string;
        export { category_44 as category };
        let relatedCommands_44: string[];
        export { relatedCommands_44 as relatedCommands };
    }
    export namespace privilegeError {
        let category_45: string;
        export { category_45 as category };
        let relatedCommands_45: string[];
        export { relatedCommands_45 as relatedCommands };
    }
    export namespace referentialCheck {
        let category_46: string;
        export { category_46 as category };
        let relatedCommands_46: string[];
        export { relatedCommands_46 as relatedCommands };
    }
    export namespace expensiveStatements {
        let category_47: string;
        export { category_47 as category };
        let relatedCommands_47: string[];
        export { relatedCommands_47 as relatedCommands };
    }
    export namespace longRunning {
        let category_48: string;
        export { category_48 as category };
        let relatedCommands_48: string[];
        export { relatedCommands_48 as relatedCommands };
    }
    export namespace deadlocks {
        let category_49: string;
        export { category_49 as category };
        let relatedCommands_49: string[];
        export { relatedCommands_49 as relatedCommands };
    }
    export namespace blocking {
        let category_50: string;
        export { category_50 as category };
        let relatedCommands_50: string[];
        export { relatedCommands_50 as relatedCommands };
    }
    export namespace queryPlan {
        let category_51: string;
        export { category_51 as category };
        let relatedCommands_51: string[];
        export { relatedCommands_51 as relatedCommands };
    }
    export namespace querySimple {
        let category_52: string;
        export { category_52 as category };
        let relatedCommands_52: string[];
        export { relatedCommands_52 as relatedCommands };
    }
    export namespace querySimpleUI {
        let category_53: string;
        export { category_53 as category };
        let relatedCommands_53: string[];
        export { relatedCommands_53 as relatedCommands };
    }
    export namespace columnStats {
        let category_54: string;
        export { category_54 as category };
        let relatedCommands_54: string[];
        export { relatedCommands_54 as relatedCommands };
    }
    export namespace tableHotspots {
        let category_55: string;
        export { category_55 as category };
        let relatedCommands_55: string[];
        export { relatedCommands_55 as relatedCommands };
    }
    export namespace indexTest {
        let category_56: string;
        export { category_56 as category };
        let relatedCommands_56: string[];
        export { relatedCommands_56 as relatedCommands };
    }
    export namespace memoryAnalysis {
        let category_57: string;
        export { category_57 as category };
        let relatedCommands_57: string[];
        export { relatedCommands_57 as relatedCommands };
    }
    export namespace memoryLeaks {
        let category_58: string;
        export { category_58 as category };
        let relatedCommands_58: string[];
        export { relatedCommands_58 as relatedCommands };
    }
    export namespace fragmentationCheck {
        let category_59: string;
        export { category_59 as category };
        let relatedCommands_59: string[];
        export { relatedCommands_59 as relatedCommands };
    }
    export namespace reclaim {
        let category_60: string;
        export { category_60 as category };
        let relatedCommands_60: string[];
        export { relatedCommands_60 as relatedCommands };
    }
    export namespace backup {
        let category_61: string;
        export { category_61 as category };
        let relatedCommands_61: string[];
        export { relatedCommands_61 as relatedCommands };
    }
    export namespace backupStatus {
        let category_62: string;
        export { category_62 as category };
        let relatedCommands_62: string[];
        export { relatedCommands_62 as relatedCommands };
    }
    export namespace backupList {
        let category_63: string;
        export { category_63 as category };
        let relatedCommands_63: string[];
        export { relatedCommands_63 as relatedCommands };
    }
    export namespace restore {
        let category_64: string;
        export { category_64 as category };
        let relatedCommands_64: string[];
        export { relatedCommands_64 as relatedCommands };
    }
    export namespace replicationStatus {
        let category_65: string;
        export { category_65 as category };
        let relatedCommands_65: string[];
        export { relatedCommands_65 as relatedCommands };
    }
    export namespace systemInfo {
        let category_66: string;
        export { category_66 as category };
        let relatedCommands_66: string[];
        export { relatedCommands_66 as relatedCommands };
    }
    export namespace systemInfoUI {
        let category_67: string;
        export { category_67 as category };
        let relatedCommands_67: string[];
        export { relatedCommands_67 as relatedCommands };
    }
    export namespace status {
        let category_68: string;
        export { category_68 as category };
        let relatedCommands_68: string[];
        export { relatedCommands_68 as relatedCommands };
    }
    export namespace healthCheck {
        let category_69: string;
        export { category_69 as category };
        let relatedCommands_69: string[];
        export { relatedCommands_69 as relatedCommands };
    }
    export namespace version {
        let category_70: string;
        export { category_70 as category };
        let relatedCommands_70: string[];
        export { relatedCommands_70 as relatedCommands };
    }
    export namespace diagnose {
        let category_71: string;
        export { category_71 as category };
        let relatedCommands_71: string[];
        export { relatedCommands_71 as relatedCommands };
    }
    export namespace users {
        let category_72: string;
        export { category_72 as category };
        let relatedCommands_72: string[];
        export { relatedCommands_72 as relatedCommands };
    }
    export namespace roles {
        let category_73: string;
        export { category_73 as category };
        let relatedCommands_73: string[];
        export { relatedCommands_73 as relatedCommands };
    }
    export namespace inspectUser {
        let category_74: string;
        export { category_74 as category };
        let relatedCommands_74: string[];
        export { relatedCommands_74 as relatedCommands };
    }
    export namespace massUsers {
        let category_75: string;
        export { category_75 as category };
        let relatedCommands_75: string[];
        export { relatedCommands_75 as relatedCommands };
    }
    export namespace massGrant {
        let category_76: string;
        export { category_76 as category };
        let relatedCommands_76: string[];
        export { relatedCommands_76 as relatedCommands };
    }
    export namespace pwdPolicy {
        let category_77: string;
        export { category_77 as category };
        let relatedCommands_77: string[];
        export { relatedCommands_77 as relatedCommands };
    }
    export namespace createXSAAdmin {
        let category_78: string;
        export { category_78 as category };
        let relatedCommands_78: string[];
        export { relatedCommands_78 as relatedCommands };
    }
    export namespace createGroup {
        let category_79: string;
        export { category_79 as category };
        let relatedCommands_79: string[];
        export { relatedCommands_79 as relatedCommands };
    }
    export namespace dropGroup {
        let category_80: string;
        export { category_80 as category };
        let relatedCommands_80: string[];
        export { relatedCommands_80 as relatedCommands };
    }
    export namespace massExport {
        let category_81: string;
        export { category_81 as category };
        let relatedCommands_81: string[];
        export { relatedCommands_81 as relatedCommands };
    }
    export namespace massDelete {
        let category_82: string;
        export { category_82 as category };
        let relatedCommands_82: string[];
        export { relatedCommands_82 as relatedCommands };
    }
    export namespace massUpdate {
        let category_83: string;
        export { category_83 as category };
        let relatedCommands_83: string[];
        export { relatedCommands_83 as relatedCommands };
    }
    export namespace massConvert {
        let category_84: string;
        export { category_84 as category };
        let relatedCommands_84: string[];
        export { relatedCommands_84 as relatedCommands };
    }
    export namespace massConvertUI {
        let category_85: string;
        export { category_85 as category };
        let relatedCommands_85: string[];
        export { relatedCommands_85 as relatedCommands };
    }
    export namespace massRename {
        let category_86: string;
        export { category_86 as category };
        let relatedCommands_86: string[];
        export { relatedCommands_86 as relatedCommands };
    }
    export namespace connect {
        let category_87: string;
        export { category_87 as category };
        let relatedCommands_87: string[];
        export { relatedCommands_87 as relatedCommands };
    }
    export namespace connections {
        let category_88: string;
        export { category_88 as category };
        let relatedCommands_88: string[];
        export { relatedCommands_88 as relatedCommands };
    }
    export namespace connectViaServiceKey {
        let category_89: string;
        export { category_89 as category };
        let relatedCommands_89: string[];
        export { relatedCommands_89 as relatedCommands };
    }
    export namespace config {
        let category_90: string;
        export { category_90 as category };
        let relatedCommands_90: string[];
        export { relatedCommands_90 as relatedCommands };
    }
    export namespace copy2DefaultEnv {
        let category_91: string;
        export { category_91 as category };
        let relatedCommands_91: string[];
        export { relatedCommands_91 as relatedCommands };
    }
    export namespace copy2Env {
        let category_92: string;
        export { category_92 as category };
        let relatedCommands_92: string[];
        export { relatedCommands_92 as relatedCommands };
    }
    export namespace copy2Secrets {
        let category_93: string;
        export { category_93 as category };
        let relatedCommands_93: string[];
        export { relatedCommands_93 as relatedCommands };
    }
    export namespace createJWT {
        let category_94: string;
        export { category_94 as category };
        let relatedCommands_94: string[];
        export { relatedCommands_94 as relatedCommands };
    }
    export namespace btp {
        let category_95: string;
        export { category_95 as category };
        let relatedCommands_95: string[];
        export { relatedCommands_95 as relatedCommands };
    }
    export namespace btpInfo {
        let category_96: string;
        export { category_96 as category };
        let relatedCommands_96: string[];
        export { relatedCommands_96 as relatedCommands };
    }
    export namespace btpInfoUI {
        let category_97: string;
        export { category_97 as category };
        let relatedCommands_97: string[];
        export { relatedCommands_97 as relatedCommands };
    }
    export namespace btpTarget {
        let category_98: string;
        export { category_98 as category };
        let relatedCommands_98: string[];
        export { relatedCommands_98 as relatedCommands };
    }
    export namespace btpSubs {
        let category_99: string;
        export { category_99 as category };
        let relatedCommands_99: string[];
        export { relatedCommands_99 as relatedCommands };
    }
    export namespace hanaCloudInstances {
        let category_100: string;
        export { category_100 as category };
        let relatedCommands_100: string[];
        export { relatedCommands_100 as relatedCommands };
    }
    export namespace hanaCloudStart {
        let category_101: string;
        export { category_101 as category };
        let relatedCommands_101: string[];
        export { relatedCommands_101 as relatedCommands };
    }
    export namespace hanaCloudStop {
        let category_102: string;
        export { category_102 as category };
        let relatedCommands_102: string[];
        export { relatedCommands_102 as relatedCommands };
    }
    export namespace hanaCloudHDIInstances {
        let category_103: string;
        export { category_103 as category };
        let relatedCommands_103: string[];
        export { relatedCommands_103 as relatedCommands };
    }
    export namespace hanaCloudHDIInstancesUI {
        let category_104: string;
        export { category_104 as category };
        let relatedCommands_104: string[];
        export { relatedCommands_104 as relatedCommands };
    }
    export namespace hanaCloudSchemaInstances {
        let category_105: string;
        export { category_105 as category };
        let relatedCommands_105: string[];
        export { relatedCommands_105 as relatedCommands };
    }
    export namespace hanaCloudSchemaInstancesUI {
        let category_106: string;
        export { category_106 as category };
        let relatedCommands_106: string[];
        export { relatedCommands_106 as relatedCommands };
    }
    export namespace hanaCloudSBSSInstances {
        let category_107: string;
        export { category_107 as category };
        let relatedCommands_107: string[];
        export { relatedCommands_107 as relatedCommands };
    }
    export namespace hanaCloudSBSSInstancesUI {
        let category_108: string;
        export { category_108 as category };
        let relatedCommands_108: string[];
        export { relatedCommands_108 as relatedCommands };
    }
    export namespace hanaCloudSecureStoreInstances {
        let category_109: string;
        export { category_109 as category };
        let relatedCommands_109: string[];
        export { relatedCommands_109 as relatedCommands };
    }
    export namespace hanaCloudSecureStoreInstancesUI {
        let category_110: string;
        export { category_110 as category };
        let relatedCommands_110: string[];
        export { relatedCommands_110 as relatedCommands };
    }
    export namespace hanaCloudUPSInstances {
        let category_111: string;
        export { category_111 as category };
        let relatedCommands_111: string[];
        export { relatedCommands_111 as relatedCommands };
    }
    export namespace hanaCloudUPSInstancesUI {
        let category_112: string;
        export { category_112 as category };
        let relatedCommands_112: string[];
        export { relatedCommands_112 as relatedCommands };
    }
    export namespace adminHDI {
        let category_113: string;
        export { category_113 as category };
        let relatedCommands_113: string[];
        export { relatedCommands_113 as relatedCommands };
    }
    export namespace adminHDIGroup {
        let category_114: string;
        export { category_114 as category };
        let relatedCommands_114: string[];
        export { relatedCommands_114 as relatedCommands };
    }
    export namespace activateHDI {
        let category_115: string;
        export { category_115 as category };
        let relatedCommands_115: string[];
        export { relatedCommands_115 as relatedCommands };
    }
    export namespace createModule {
        let category_116: string;
        export { category_116 as category };
        let relatedCommands_116: string[];
        export { relatedCommands_116 as relatedCommands };
    }
    export namespace dropContainer {
        let category_117: string;
        export { category_117 as category };
        let relatedCommands_117: string[];
        export { relatedCommands_117 as relatedCommands };
    }
    export namespace createContainer {
        let category_118: string;
        export { category_118 as category };
        let relatedCommands_118: string[];
        export { relatedCommands_118 as relatedCommands };
    }
    export namespace createContainerUsers {
        let category_119: string;
        export { category_119 as category };
        let relatedCommands_119: string[];
        export { relatedCommands_119 as relatedCommands };
    }
    export namespace containers {
        let category_120: string;
        export { category_120 as category };
        let relatedCommands_120: string[];
        export { relatedCommands_120 as relatedCommands };
    }
    export namespace containersUI {
        let category_121: string;
        export { category_121 as category };
        let relatedCommands_121: string[];
        export { relatedCommands_121 as relatedCommands };
    }
    export namespace cds {
        let category_122: string;
        export { category_122 as category };
        let relatedCommands_122: string[];
        export { relatedCommands_122 as relatedCommands };
    }
    export namespace codeTemplate {
        let category_123: string;
        export { category_123 as category };
        let relatedCommands_123: string[];
        export { relatedCommands_123 as relatedCommands };
    }
    export namespace generateTestData {
        let category_124: string;
        export { category_124 as category };
        let relatedCommands_124: string[];
        export { relatedCommands_124 as relatedCommands };
    }
    export namespace generateDocs {
        let category_125: string;
        export { category_125 as category };
        let relatedCommands_125: string[];
        export { relatedCommands_125 as relatedCommands };
    }
    export namespace examples {
        let category_126: string;
        export { category_126 as category };
        let relatedCommands_126: string[];
        export { relatedCommands_126 as relatedCommands };
    }
    export namespace callProcedure {
        let category_127: string;
        export { category_127 as category };
        let relatedCommands_127: string[];
        export { relatedCommands_127 as relatedCommands };
    }
    export namespace hdbsql {
        let category_128: string;
        export { category_128 as category };
        let relatedCommands_128: string[];
        export { relatedCommands_128 as relatedCommands };
    }
    export namespace test {
        let category_129: string;
        export { category_129 as category };
        let relatedCommands_129: string[];
        export { relatedCommands_129 as relatedCommands };
    }
    export namespace certificates {
        let category_130: string;
        export { category_130 as category };
        let relatedCommands_130: string[];
        export { relatedCommands_130 as relatedCommands };
    }
    export namespace certificatesUI {
        let category_131: string;
        export { category_131 as category };
        let relatedCommands_131: string[];
        export { relatedCommands_131 as relatedCommands };
    }
    export namespace encryptionStatus {
        let category_132: string;
        export { category_132 as category };
        let relatedCommands_132: string[];
        export { relatedCommands_132 as relatedCommands };
    }
    export namespace securityScan {
        let category_133: string;
        export { category_133 as category };
        let relatedCommands_133: string[];
        export { relatedCommands_133 as relatedCommands };
    }
    export namespace auditLog {
        let category_134: string;
        export { category_134 as category };
        let relatedCommands_134: string[];
        export { relatedCommands_134 as relatedCommands };
    }
    export namespace hostInformation {
        let category_135: string;
        export { category_135 as category };
        let relatedCommands_135: string[];
        export { relatedCommands_135 as relatedCommands };
    }
    export namespace disks {
        let category_136: string;
        export { category_136 as category };
        let relatedCommands_136: string[];
        export { relatedCommands_136 as relatedCommands };
    }
    export namespace dataVolumes {
        let category_137: string;
        export { category_137 as category };
        let relatedCommands_137: string[];
        export { relatedCommands_137 as relatedCommands };
    }
    export namespace ports {
        let category_138: string;
        export { category_138 as category };
        let relatedCommands_138: string[];
        export { relatedCommands_138 as relatedCommands };
    }
    export namespace cacheStats {
        let category_139: string;
        export { category_139 as category };
        let relatedCommands_139: string[];
        export { relatedCommands_139 as relatedCommands };
    }
    export namespace alerts {
        let category_140: string;
        export { category_140 as category };
        let relatedCommands_140: string[];
        export { relatedCommands_140 as relatedCommands };
    }
    export namespace spatialData {
        let category_141: string;
        export { category_141 as category };
        let relatedCommands_141: string[];
        export { relatedCommands_141 as relatedCommands };
    }
    export namespace ftIndexes {
        let category_142: string;
        export { category_142 as category };
        let relatedCommands_142: string[];
        export { relatedCommands_142 as relatedCommands };
    }
    export namespace sdiTasks {
        let category_143: string;
        export { category_143 as category };
        let relatedCommands_143: string[];
        export { relatedCommands_143 as relatedCommands };
    }
    export namespace timeSeriesTools {
        let category_144: string;
        export { category_144 as category };
        let relatedCommands_144: string[];
        export { relatedCommands_144 as relatedCommands };
    }
    export namespace workloadManagement {
        let category_145: string;
        export { category_145 as category };
        let relatedCommands_145: string[];
        export { relatedCommands_145 as relatedCommands };
    }
    export namespace traceContents {
        let category_146: string;
        export { category_146 as category };
        let relatedCommands_146: string[];
        export { relatedCommands_146 as relatedCommands };
    }
    export namespace traces {
        let category_147: string;
        export { category_147 as category };
        let relatedCommands_147: string[];
        export { relatedCommands_147 as relatedCommands };
    }
    export namespace crashDumps {
        let category_148: string;
        export { category_148 as category };
        let relatedCommands_148: string[];
        export { relatedCommands_148 as relatedCommands };
    }
    export namespace xsaServices {
        let category_149: string;
        export { category_149 as category };
        let relatedCommands_149: string[];
        export { relatedCommands_149 as relatedCommands };
    }
    export namespace UI {
        let category_150: string;
        export { category_150 as category };
        let relatedCommands_150: string[];
        export { relatedCommands_150 as relatedCommands };
    }
    export namespace readMeUI {
        let category_151: string;
        export { category_151 as category };
        let relatedCommands_151: string[];
        export { relatedCommands_151 as relatedCommands };
    }
    export namespace readMe {
        let category_152: string;
        export { category_152 as category };
        let relatedCommands_152: string[];
        export { relatedCommands_152 as relatedCommands };
    }
    export namespace openReadMe {
        let category_153: string;
        export { category_153 as category };
        let relatedCommands_153: string[];
        export { relatedCommands_153 as relatedCommands };
    }
    export namespace helpDocu {
        let category_154: string;
        export { category_154 as category };
        let relatedCommands_154: string[];
        export { relatedCommands_154 as relatedCommands };
    }
    export namespace viewDocs {
        let category_155: string;
        export { category_155 as category };
        let relatedCommands_155: string[];
        export { relatedCommands_155 as relatedCommands };
    }
    export namespace kb {
        let category_156: string;
        export { category_156 as category };
        let relatedCommands_156: string[];
        export { relatedCommands_156 as relatedCommands };
    }
    export namespace interactive {
        let category_157: string;
        export { category_157 as category };
        let relatedCommands_157: string[];
        export { relatedCommands_157 as relatedCommands };
    }
    export namespace openChangeLog {
        let category_158: string;
        export { category_158 as category };
        let relatedCommands_158: string[];
        export { relatedCommands_158 as relatedCommands };
    }
    export namespace changeLog {
        let category_159: string;
        export { category_159 as category };
        let relatedCommands_159: string[];
        export { relatedCommands_159 as relatedCommands };
    }
    export namespace changeLogUI {
        let category_160: string;
        export { category_160 as category };
        let relatedCommands_160: string[];
        export { relatedCommands_160 as relatedCommands };
    }
    export namespace openDBExplorer {
        let category_161: string;
        export { category_161 as category };
        let relatedCommands_161: string[];
        export { relatedCommands_161 as relatedCommands };
    }
    export namespace openBAS {
        let category_162: string;
        export { category_162 as category };
        let relatedCommands_162: string[];
        export { relatedCommands_162 as relatedCommands };
    }
    export namespace issue {
        let category_163: string;
        export { category_163 as category };
        let relatedCommands_163: string[];
        export { relatedCommands_163 as relatedCommands };
    }
    export namespace features {
        let category_164: string;
        export { category_164 as category };
        let relatedCommands_164: string[];
        export { relatedCommands_164 as relatedCommands };
    }
    export namespace featuresUI {
        let category_165: string;
        export { category_165 as category };
        let relatedCommands_165: string[];
        export { relatedCommands_165 as relatedCommands };
    }
    export namespace featureUsage {
        let category_166: string;
        export { category_166 as category };
        let relatedCommands_166: string[];
        export { relatedCommands_166 as relatedCommands };
    }
    export namespace featureUsageUI {
        let category_167: string;
        export { category_167 as category };
        let relatedCommands_167: string[];
        export { relatedCommands_167 as relatedCommands };
    }
    export namespace tableGroups {
        let category_168: string;
        export { category_168 as category };
        let relatedCommands_168: string[];
        export { relatedCommands_168 as relatedCommands };
    }
    export namespace tablesUI {
        let category_169: string;
        export { category_169 as category };
        let relatedCommands_169: string[];
        export { relatedCommands_169 as relatedCommands };
    }
    export namespace tablesPG {
        let category_170: string;
        export { category_170 as category };
        let relatedCommands_170: string[];
        export { relatedCommands_170 as relatedCommands };
    }
    export namespace tablesSQLite {
        let category_171: string;
        export { category_171 as category };
        let relatedCommands_171: string[];
        export { relatedCommands_171 as relatedCommands };
    }
    export namespace tableCopy {
        let category_172: string;
        export { category_172 as category };
        let relatedCommands_172: string[];
        export { relatedCommands_172 as relatedCommands };
    }
    export namespace partitions {
        let category_173: string;
        export { category_173 as category };
        let relatedCommands_173: string[];
        export { relatedCommands_173 as relatedCommands };
    }
    export namespace dataTypes {
        let category_174: string;
        export { category_174 as category };
        let relatedCommands_174: string[];
        export { relatedCommands_174 as relatedCommands };
    }
    export namespace dataTypesUI {
        let category_175: string;
        export { category_175 as category };
        let relatedCommands_175: string[];
        export { relatedCommands_175 as relatedCommands };
    }
    export namespace functionsUI {
        let category_176: string;
        export { category_176 as category };
        let relatedCommands_176: string[];
        export { relatedCommands_176 as relatedCommands };
    }
    export namespace importUI {
        let category_177: string;
        export { category_177 as category };
        let relatedCommands_177: string[];
        export { relatedCommands_177 as relatedCommands };
    }
    export namespace indexesUI {
        let category_178: string;
        export { category_178 as category };
        let relatedCommands_178: string[];
        export { relatedCommands_178 as relatedCommands };
    }
    export namespace schemasUI {
        let category_179: string;
        export { category_179 as category };
        let relatedCommands_179: string[];
        export { relatedCommands_179 as relatedCommands };
    }
    export namespace iniContents {
        let category_180: string;
        export { category_180 as category };
        let relatedCommands_180: string[];
        export { relatedCommands_180 as relatedCommands };
    }
    export namespace iniFiles {
        let category_181: string;
        export { category_181 as category };
        let relatedCommands_181: string[];
        export { relatedCommands_181 as relatedCommands };
    }
    export namespace rick {
        let category_182: string;
        export { category_182 as category };
        let relatedCommands_182: string[];
        export { relatedCommands_182 as relatedCommands };
    }
    export namespace recommendations {
        let category_183: string;
        export { category_183 as category };
        let relatedCommands_183: string[];
        export { relatedCommands_183 as relatedCommands };
    }
    export namespace dependencies {
        let category_184: string;
        export { category_184 as category };
        let relatedCommands_184: string[];
        export { relatedCommands_184 as relatedCommands };
    }
}
declare namespace _default {
    export { commandMetadata };
    export { getCommandMetadata };
    export { getPrimaryCommand };
}
export default _default;
