
@cds.persistence.exists 
Entity ![hdw_bizent_adm_data::cdsBizent_Asset] {
 key 	![ASSET_ID]: String(100)  @title: 'ASSET_ID: Asset Id' ; 
key 	![ASSET_TYPE]: String(100)  @title: 'ASSET_TYPE: Asset Type' ; 
	![ASSET_NAME]: String(255)  @title: 'ASSET_NAME: Asset Name' ; 
}

@cds.persistence.exists 
Entity ![hdw_bizent_adm_data::cdsBizent_BizentAssetRelationships] {
 key 	![BOOKING_ENTITY_ID]: Integer64  @title: 'BOOKING_ENTITY_ID: Business Entity Id' ; 
key 	![BUSINESS_ENTITY_ID]: Integer64  @title: 'BUSINESS_ENTITY_ID: Business Entity Id' ; 
key 	![RELATIONSHIP_ID]: Integer64  @title: 'RELATIONSHIP_ID: Relationship Id' ; 
key 	![RELATIONSHIP_TYPE]: String(20)  @title: 'RELATIONSHIP_TYPE: Relationship Type' ; 
key 	![ASSET_ID]: String(100)  @title: 'ASSET_ID: Asset Id' ; 
key 	![ASSET_TYPE]: String(100)  @title: 'ASSET_TYPE: Asset Type' ; 
	![VALID_FROM]: String  @title: 'VALID_FROM: Valid From' ; 
	![VALID_TO]: String  @title: 'VALID_TO: Valid To' ; 
	![VALID_FROM_TS]: Timestamp  @title: 'VALID_FROM_TS: Valid From Timestamp' ; 
	![VALID_TO_TS]: Timestamp  @title: 'VALID_TO_TS: Valid To Timestamp' ; 
	![IS_EXPIRED_FLG]: **UNSUPPORTED TYPE - TINYINT  @title: 'IS_EXPIRED_FLG: IS_EXPIRED' ; 
	![EXPIRY_TS]: Timestamp  @title: 'EXPIRY_TS: Expiration Date' ; 
	![timestamp]: Timestamp  @title: 'timestamp' ; 
	![IS_ACTIVE]: **UNSUPPORTED TYPE - TINYINT  @title: 'IS_ACTIVE: Is Active Record?' ; 
	![EFFECTIVE_TS]: Timestamp  @title: 'EFFECTIVE_TS: Effective datetime' ; 
}

@cds.persistence.exists 
Entity ![hdw_bizent_adm_data::cdsBizent_BookingEntity] {
 	![ID]: Integer64  @title: 'ID:  Booking Entity ID' ; 
	![BUSINESS_ENTITY_ID]: Integer64  @title: 'BUSINESS_ENTITY_ID: Business Entity Id' ; 
	![LEGAL_ENTITY_NM]: String(256)  @title: 'LEGAL_ENTITY_NM: Legal Entity Name' ; 
	![REGISTRATION_CC1]: String(2)  @title: 'REGISTRATION_CC1: Registration Country Code 1' ; 
	![REGISTRATION_NO]: String(100)  @title: 'REGISTRATION_NO: Registration Number' ; 
	![URL]: String(1024)  @title: 'URL: Url' ; 
	![VAT_NO]: String(100)  @title: 'VAT_NO: VAT Number' ; 
	![ADDRESS]: String(1024)  @title: 'ADDRESS:  Address ' ; 
}

@cds.persistence.exists 
Entity ![hdw_bizent_adm_data::cdsBizent_BusinessEntity] {
 key 	![BUSINESS_ENTITY_ID]: Integer64  @title: 'BUSINESS_ENTITY_ID: Business Entity Id' ; 
	![ATTRIBUTE_VERSION_ID]: Integer64  @title: 'ATTRIBUTE_VERSION_ID: Attribute Version Id' ; 
	![BUSINESS_ENTITY_TYPE]: String(100)  @title: 'BUSINESS_ENTITY_TYPE: Business Entity Type' ; 
	![LEGAL_ENTITY_NM]: String(256)  @title: 'LEGAL_ENTITY_NM: Legal Entity Name' ; 
	![OLD_SAP_PARTNER_ID]: String(10)  @title: 'OLD_SAP_PARTNER_ID: SAP PARTNER ID OLD' ; 
	![SAP_BP_ID]: String(10)  @title: 'SAP_BP_ID: SAP Business Partner Id' ; 
	![ADDRESS1]: String(1024)  @title: 'ADDRESS1: Address Line 1' ; 
	![ADDRESS2]: String(1024)  @title: 'ADDRESS2: Address Line 2' ; 
	![ZIP_CD]: String(128)  @title: 'ZIP_CD: Zip code' ; 
	![CITY_NM]: String(1024)  @title: 'CITY_NM: City' ; 
	![COUNTRY_CD]: String(128)  @title: 'COUNTRY_CD: Country' ; 
	![CONTACT_PERSON_NM]: String(256)  @title: 'CONTACT_PERSON_NM: Contact Person Name' ; 
	![TELEPHONE_NO]: String(128)  @title: 'TELEPHONE_NO: Telephone Number' ; 
	![EMAIL]: String(128)  @title: 'EMAIL: Email Address' ; 
	![ENTITY_URL]: String(1024)  @title: 'ENTITY_URL: Entity Url' ; 
	![PREFERRED_LANG_CD]: String(10)  @title: 'PREFERRED_LANG_CD: Preferred Language' ; 
	![REGISTRATION_NO]: String(100)  @title: 'REGISTRATION_NO: Registration Number' ; 
	![TAX_REFERENCE_ID]: String(256)  @title: 'TAX_REFERENCE_ID: Tax Reference ID' ; 
	![TAX_SRC]: String(100)  @title: 'TAX_SRC: Tax Source' ; 
	![CREATED_BY]: String(100)  @title: 'CREATED_BY: Created By User' ; 
}

@cds.persistence.exists 
Entity ![hdw_bizent_adm_data::cdsBizent_InvoiceRelationship] {
 key 	![RELATIONSHIP_ID]: Integer64  @title: 'RELATIONSHIP_ID: Relationship Id' ; 
	![REL_ATTRIBUTE_VERSION_ID]: Integer64  @title: 'REL_ATTRIBUTE_VERSION_ID: Relationship Attribute Version Id' ; 
	![ADDRESS1]: String(1024)  @title: 'ADDRESS1: Address Line 1' ; 
	![ADDRESS2]: String(1024)  @title: 'ADDRESS2: Address Line 2' ; 
	![ZIP_CD]: String(128)  @title: 'ZIP_CD: Zip code' ; 
	![CITY_NM]: String(1024)  @title: 'CITY_NM: City' ; 
	![COUNTRY_CD]: String(128)  @title: 'COUNTRY_CD: Country' ; 
	![TELEPHONE_NO]: String(128)  @title: 'TELEPHONE_NO: Telephone Number' ; 
	![EMAIL]: String(128)  @title: 'EMAIL: Email Address' ; 
	![BANK_DETAIL_REF_ID]: String(100)  @title: 'BANK_DETAIL_REF_ID:  Bank Detail Reference ID' ; 
	![BANK_DETAIL_SRC]: String(100)  @title: 'BANK_DETAIL_SRC:  Bank Detail Source' ; 
	![CENTRAL_PAY_METHOD_PROVIDER]: String(100)  @title: 'CENTRAL_PAY_METHOD_PROVIDER:  Central Payment Method Provider' ; 
	![COUNTRY_DATA_CC1]: String(2)  @title: 'COUNTRY_DATA_CC1: Country Specific Data - CC1' ; 
	![COUNTRY_DATA_POSTAL_ADDRESS]: String(1024)  @title: 'COUNTRY_DATA_POSTAL_ADDRESS: Country Specific Data - Postal Address' ; 
	![CURR]: String(3)  @title: 'CURR: Currency Code' ; 
	![INV_LOCALE]: String(5)  @title: 'INV_LOCALE: Invoice Locale' ; 
	![INV_NOTIF_CHANNEL]: String(100)  @title: 'INV_NOTIF_CHANNEL: Invoice Notification Channel' ; 
	![INV_SCHEDULE]: String(1024)  @title: 'INV_SCHEDULE: Invoice Schedule' ; 
	![INV_PAY_MODEL_TYPE]: String(100)  @title: 'INV_PAY_MODEL_TYPE: Invoicing Payment Model Type' ; 
	![PAYMENT_METHOD_CD]: String(100)  @title: 'PAYMENT_METHOD_CD: Payment Method' ; 
	![PAYMENT_TERM]: Integer  @title: 'PAYMENT_TERM: Payment Term' ; 
	![REPORTING_DAYS]: Integer  @title: 'REPORTING_DAYS: Reporting Days' ; 
	![SETTLEMENT_CURR]: String(3)  @title: 'SETTLEMENT_CURR:  Settlement Currency' ; 
	![CREATED_BY]: String(100)  @title: 'CREATED_BY: Created By User' ; 
}

@cds.persistence.exists 
Entity ![hdw_bizent_adm_data::cdsBizent_PayoutRelationship] {
 key 	![RELATIONSHIP_ID]: Integer64  @title: 'RELATIONSHIP_ID: Relationship Id' ; 
	![REL_ATTRIBUTE_VERSION_ID]: Integer64  @title: 'REL_ATTRIBUTE_VERSION_ID: Relationship Attribute Version Id' ; 
	![LOAD_CURR]: String(3)  @title: 'LOAD_CURR: Load Currency' ; 
	![PAYMENT_METHOD_REF_ID]: String(100)  @title: 'PAYMENT_METHOD_REF_ID: Payment Method Reference ID' ; 
	![PAYMENT_METHOD_SRC]: String(100)  @title: 'PAYMENT_METHOD_SRC: Payment Method Source' ; 
	![PAYMENT_METHOD_CD]: String(100)  @title: 'PAYMENT_METHOD_CD: Payment Method Code' ; 
	![PAYOUT_COUNTRY_CD]: String(2)  @title: 'PAYOUT_COUNTRY_CD: Payout Country Code' ; 
	![PAYOUT_CURR]: String(3)  @title: 'PAYOUT_CURR: Payout Currency' ; 
	![PAYOUT_STATUS]: String(30)  @title: 'PAYOUT_STATUS: Payout Status' ; 
	![PAYOUT_MODEL_TYPE]: String(30)  @title: 'PAYOUT_MODEL_TYPE: Payout Type' ; 
	![WITHDRAW_CYCLE]: String(1024)  @title: 'WITHDRAW_CYCLE: Withdrawl cycle' ; 
}

@cds.persistence.exists 
Entity ![hdw_bizent_adm_data::cdsBizent_PayoutRelationshipTimeDepAttr] {
 key 	![SURR_ID]: Integer64  @title: 'SURR_ID: Surrogate Id' ; 
key 	![RELATIONSHIP_ID]: Integer64  @title: 'RELATIONSHIP_ID: Relationship Id' ; 
	![VALID_TO]: String  @title: 'VALID_TO: Valid To' ; 
	![VALID_FROM]: String  @title: 'VALID_FROM: Valid From' ; 
	![ATTRIBUTE_VERSION_ID]: Integer64  @title: 'ATTRIBUTE_VERSION_ID: Attribute Version Id' ; 
	![PAYMENT_METHOD_CD]: String(100)  @title: 'PAYMENT_METHOD_CD: Payment Method Code' ; 
	![PAYOUT_MODEL_TYPE]: String(30)  @title: 'PAYOUT_MODEL_TYPE: Payout Type' ; 
	![WITHDRAW_CYCLE]: String(1024)  @title: 'WITHDRAW_CYCLE: Withdrawl cycle' ; 
	![timestamp]: Timestamp  @title: 'timestamp' ; 
	![IS_ACTIVE]: **UNSUPPORTED TYPE - TINYINT  @title: 'IS_ACTIVE: Is Active Record?' ; 
	![VALID_FROM_TS]: Timestamp  @title: 'VALID_FROM_TS: Valid From Timestamp' ; 
	![VALID_TO_TS]: Timestamp  @title: 'VALID_TO_TS: Valid To Timestamp' ; 
}

@cds.persistence.exists 
Entity ![hdw_bizent_adm_data::cdsDimension_AssetType] {
 	![ASSET_TYPE]: String(100)  @title: 'ASSET_TYPE: Asset Type' ; 
	![ASSET_TYPE_NAME]: String(100)  @title: 'ASSET_TYPE_NAME: Asset Type Name' ; 
}

@cds.persistence.exists 
Entity ![hdw_bizent_adm_data::cdsDimension_InvoicingPaymentMethod] {
 	![INVOICING_PAYMENT_METHOD]: String(40)  @title: 'INVOICING_PAYMENT_METHOD: Invoicing Payment Method Type Id' ; 
	![INVOICING_PAYMENT_METHOD_NAME]: String(60)  @title: 'INVOICING_PAYMENT_METHOD_NAME: Invoicing Payment Method Type' ; 
}

@cds.persistence.exists 
Entity ![hdw_bizent_adm_data::cdsDimension_InvoicingPaymentModelType] {
 	![INVOICING_PAYMENT_MODEL_TYPE]: String(20)  @title: 'INVOICING_PAYMENT_MODEL_TYPE: Invoicing Payment Model Type Id' ; 
	![INVOICING_PAYMENT_MODEL_TYPE_NAME]: String(60)  @title: 'INVOICING_PAYMENT_MODEL_TYPE_NAME: Invoicing Payment Model Type' ; 
}

@cds.persistence.exists 
Entity ![hdw_bizent_adm_data::cdsDimension_PayoutPaymentDetailSource] {
 	![PAYOUT_PAYMENT_DETAIL_SOURCE]: String(20)  @title: 'PAYOUT_PAYMENT_DETAIL_SOURCE: Payout Payment Detail Source Id' ; 
	![PAYOUT_PAYMENT_DETAIL_SOURCE_NAME]: String(60)  @title: 'PAYOUT_PAYMENT_DETAIL_SOURCE_NAME: Payout Payment Detail Source' ; 
}

@cds.persistence.exists 
Entity ![hdw_bizent_adm_data::cdsDimension_PayoutPaymentMethod] {
 	![PAYOUT_PAYMENT_METHOD]: String(40)  @title: 'PAYOUT_PAYMENT_METHOD: Payout Payment Method Type Id' ; 
	![PAYOUT_PAYMENT_METHOD_NAME]: String(60)  @title: 'PAYOUT_PAYMENT_METHOD_NAME: Payout Payment Method Type' ; 
}

@cds.persistence.exists 
Entity ![hdw_bizent_adm_data::cdsDimension_PayoutStatus] {
 	![PAYOUT_STATUS]: String(20)  @title: 'PAYOUT_STATUS: Payout Status' ; 
	![PAYOUT_STATUS_NAME]: String(60)  @title: 'PAYOUT_STATUS_NAME: Payout Status' ; 
}

@cds.persistence.exists 
Entity ![hdw_bizent_adm_data::cdsDimension_PayoutType] {
 	![PAYOUT_TYPE]: String(10)  @title: 'PAYOUT_TYPE: Payout Types Type Id' ; 
	![PAYOUT_TYPE_NAME]: String(40)  @title: 'PAYOUT_TYPE_NAME: Payout Types Type' ; 
}

@cds.persistence.exists 
Entity ![hdw_bizent_adm_data::cdsDimension_RelationshipType] {
 	![RELATIONSHIP_TYPE]: String(20)  @title: 'RELATIONSHIP_TYPE: Relationship Type Id' ; 
	![RELATIONSHIP_TYPE_NAME]: String(60)  @title: 'RELATIONSHIP_TYPE_NAME: Relationship Type' ; 
}

@cds.persistence.exists 
Entity ![hdw_bizent_adm_data::cdsDimension_Tenancies] {
 	![TENANT]: String(20)  @title: 'TENANT: Tenant Id' ; 
	![TENANT_NAME]: String(100)  @title: 'TENANT_NAME: Tenant' ; 
}

@cds.persistence.exists 
Entity ![hdw_bizent_adm_data::cdsTypes_tt_PayoutRelationshipTimeDepAttr] {
 	![RELATIONSHIP_ID]: Integer64  @title: 'RELATIONSHIP_ID' ; 
	![VALID_TO]: String  @title: 'VALID_TO' ; 
	![VALID_FROM]: String  @title: 'VALID_FROM' ; 
	![ATTRIBUTE_VERSION_ID]: Integer64  @title: 'ATTRIBUTE_VERSION_ID' ; 
	![PAYMENT_METHOD_CD]: String(100)  @title: 'PAYMENT_METHOD_CD' ; 
	![PAYOUT_MODEL_TYPE]: String(30)  @title: 'PAYOUT_MODEL_TYPE' ; 
	![WITHDRAW_CYCLE]: String(1024)  @title: 'WITHDRAW_CYCLE' ; 
	![timestamp]: Timestamp  @title: 'timestamp' ; 
}
