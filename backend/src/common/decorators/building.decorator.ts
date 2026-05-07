import { SetMetadata } from '@nestjs/common';

export const BUILDING_SCOPED_KEY = 'buildingScoped';
export const BuildingScoped = () => SetMetadata(BUILDING_SCOPED_KEY, true);
