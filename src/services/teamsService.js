import * as msal from '@azure/msal-node';
import axios from 'axios';

const msalConfig = {
    auth: {
        clientId: process.env.MS_GRAPH_CLIENT_ID,
        authority: `https://login.microsoftonline.com/${process.env.MS_GRAPH_TENANT_ID}`,
        clientSecret: process.env.MS_GRAPH_CLIENT_SECRET,
    }
};

const cca = new msal.ConfidentialClientApplication(msalConfig);

export async function obtenerToken() {
    const tokenRequest = {
        scopes: ['https://graph.microsoft.com/.default'], 
    };

    try {
        const response = await cca.acquireTokenByClientCredential(tokenRequest);
        console.log("✅ ¡Conexión exitosa con Azure! Token generado.");
        return response.accessToken;
    } catch (error) {
        console.error("❌ Error conectando con Azure:", error.response?.data || error.message);
        throw error;
    }
}

export async function obtenerReporteAsistencia(userId, meetingId) {
    try {
        const token = await obtenerToken();
        
        const url = `https://graph.microsoft.com/v1.0/users/${userId}/onlineMeetings/${meetingId}/attendanceReports`;

        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return response.data.value; 
    } catch (error) {
        console.error("Error obteniendo reporte de Teams:", error.response?.data || error.message);
        throw error;
    }
}