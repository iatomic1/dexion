export interface PaginatedFtBasicMetadataResponse {
	limit: number;
	offset: number;
	total: number;
	results: FtBasicMetadataResponse[];
}
export interface FtBasicMetadataResponse {
	name?: string;
	symbol?: string;
	decimals?: number;
	total_supply?: string;
	token_uri?: string;
	description?: string;
	image_uri?: string;
	image_thumbnail_uri?: string;
	image_canonical_uri?: string;
	tx_id: string;
	sender_address: string;
	contract_principal: string;
}
