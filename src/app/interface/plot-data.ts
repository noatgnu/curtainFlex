import {IDataFrame} from "data-forge";

export interface PlotData {
  id: string;
  filename: string;
  df: IDataFrame;
  form: any;
  settings: any;
  samples: any[];
  plotType: string;
  searchLinkTo: string;
  extraMetaDataDBID?: string;
  ptm: boolean;
}

export interface PlotDataGeneric {
  df: any;
  form: any;
  settings: any;
  samples: any[];
  plotType: string;
  searchLinkTo?: string;
  extraMetaDataDBID?: string;
}
