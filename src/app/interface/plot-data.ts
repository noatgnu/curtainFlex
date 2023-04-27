import {IDataFrame} from "data-forge";

export interface PlotData {
  df: IDataFrame;
  form: any;
  settings: any;
  samples: any[];
  plotType: string;
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
