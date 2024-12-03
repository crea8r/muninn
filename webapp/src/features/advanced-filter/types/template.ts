import { FilterConfig } from 'src/types/FilterConfig';
import { ViewConfigBase } from './view-config';

export interface Template {
  id?: string;
  name?: string;
  description?: string;
  config: {
    version: string;
    filter?: Partial<FilterConfig>;
    view?: Partial<ViewConfigBase>;
  };
}
