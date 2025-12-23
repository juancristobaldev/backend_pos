import {
    WebpayPlus,
    Environment,
    Options,
  } from 'transbank-sdk';
  
  /**
   * Credenciales OFICIALES de integración (Transbank)
   * NO usar en producción
   */
  const COMMERCE_CODE = '597055555532';
  const API_KEY = '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C'; // integración
  
  export const webpayTx = new WebpayPlus.Transaction(
    new Options(
      COMMERCE_CODE,
      API_KEY,
      Environment.Integration,
    ),
  );
  