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
}

export interface PlotDataGeneric {
  df: any;
  form: any;
  settings: any;
  samples: any[];
  plotType: string;
  extraMetaDataDBID?: string;
}
