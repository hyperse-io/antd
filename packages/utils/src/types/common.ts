export interface IErrorInfo {
  code?: string;
  message?: string;
}

export type RquestResponse<T> = {
  code: string;
  message: string;
  data: T;
};

export interface UserInfo {
  accessToken: string;
}

export type LabelValueItem<
  T extends string | number | boolean = string | number,
> = {
  value: T;
  label: string;
};
