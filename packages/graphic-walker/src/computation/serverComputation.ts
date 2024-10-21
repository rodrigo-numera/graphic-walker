import type { IDataQueryPayload, IDataQueryWorkflowStep, IFilterFiledSimple, IRow } from "../interfaces";
import { applyFilter, applySort, applyViewQuery, transformDataService } from "../services";

export const dataQueryServer = async (
    rawData: IRow[],
    workflow: IDataQueryWorkflowStep[],
    uid: string,   // Adiciona o UID como parâmetro
    offset?: number,
    limit?: number,
): Promise<IRow[]> => {
    if (process.env.NODE_ENV !== "production") {
        console.log(`Server query triggered for UID: ${uid}`); // Inclui o UID nos logs
    }

    let res = rawData;

    for await (const step of workflow) {
        switch (step.type) {
            case 'filter': {
                res = await applyFilter(res, step.filters.map(filter => {
                    const res: IFilterFiledSimple = {
                        fid: filter.fid,
                        rule: filter.rule,
                    };
                    return res;
                }).filter(Boolean));
                break;
            }
            case 'transform': {
                res = await transformDataService(res, step.transform);
                break;
            }
            case 'view': {
                for await (const job of step.query) {
                    res = await applyViewQuery(res, job);
                }
                break;
            }
            case 'sort': {
                res = await applySort(res, step.by, step.sort);
                break;
            }
            default: {
                // @ts-expect-error - runtime check
                console.warn(new Error(`Unknown step type: ${step.type}`));
                break;
            }
        }
    }

    // Retorna o resultado final após aplicar offset e limit
    return res.slice(offset ?? 0, limit ? ((offset ?? 0) + limit) : undefined);
};

export const getServerComputation = (rawData: IRow[]) => (payload: IDataQueryPayload) => {
    const { uid, workflow, offset, limit } = payload;
    return dataQueryServer(rawData, workflow, uid, offset, limit); // Passa o UID para o dataQueryClient
};
