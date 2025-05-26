export type PhoneModel = {
  id: number;
  name: string;
  slug: string;
  brand: number;
  brand_name?: string;
};

export type Brand = {
  id: number;
  name: string;
  slug: string;
  logo?: string | null;
  description?: string | null;
  phone_models?: PhoneModel[];
};
