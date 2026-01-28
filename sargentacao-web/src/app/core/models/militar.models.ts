export type MilitarResponse = {
id: number;
numeroFuncional: string;
nome: string;
ativo: boolean;
};

export type MilitarCreateRequest = {
numeroFuncional: string;
nome: string;
ativo?: boolean; // backend default true, mas deixo opcional
};

export type MilitarUpdateRequest = {
numeroFuncional: string;
nome: string;
ativo: boolean;
};
