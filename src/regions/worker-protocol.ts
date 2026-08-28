import type {
  AnalyzeArtworkRegionsInput,
  AnalyzeArtworkRegionsResult,
  RegionAnalysisProgress,
} from './types';

export type RegionWorkerRequest =
  | {
      type: 'analyze';
      requestId: string;
      input: AnalyzeArtworkRegionsInput;
    }
  | {
      type: 'dispose';
      requestId: string;
    };
export type RegionWorkerResponse =
  | {
      type: 'progress';
      requestId: string;
      progress: RegionAnalysisProgress;
    }
  | {
      type: 'result';
      requestId: string;
      result: AnalyzeArtworkRegionsResult;
    }
  | {
      type: 'error';
      requestId: string;
      error: { message: string; code: 'analysis-failed' | 'disposed' };
    }
  | {
      type: 'disposed';
      requestId: string;
    };
