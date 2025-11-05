import { BrandWithRelations } from '../brands.service';

export interface CreateBrandResponse extends BrandWithRelations {
  access_token: {
    id: string;
    slug: string;
    name: string;
    isVerified: boolean;
  };
}
