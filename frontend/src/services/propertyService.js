import apiClient from "./apiClient";

export const filterProperties = async (filters = {}) => {
    const payload = {};
    if (filters.location) payload.location = filters.location;
    if (filters.type) payload.type = filters.type;
    if (filters.bedrooms) payload.bedrooms = Number(filters.bedrooms);
    if (filters.min_price !== undefined) payload.min_price = Number(filters.min_price);
    if (filters.max_price !== undefined) payload.max_price = Number(filters.max_price);

    return apiClient.post('/api/properties/filter', payload);
};


export const getPropertyById = (id) =>
    apiClient.get(`/api/properties/${id}`);

export const subscribeToPropertyAlerts = (propertyId, email) =>
    apiClient.post(`/api/properties/${propertyId}/alerts/subscribe`, { email });

export const unsubscribeFromPropertyAlerts = (propertyId, email) =>
    apiClient.post(`/api/properties/${propertyId}/alerts/unsubscribe`, { email });

export const sendBuyRequest = async (payload) => {
    return apiClient.post('/api/requests', {
        propertyId: payload.propertyId,
        requesterName: payload.buyerName,
        requesterEmail: payload.buyerEmail,
        offerAmount: payload.offerAmount,
        message: payload.message,
    });
};

export const getSellerRequests = async (sellerEmail) => {
    const allRes = await apiClient.get('/api/requests');
    const allRequests = Array.isArray(allRes.data) ? allRes.data : [];
    const normalizedSellerEmail = String(sellerEmail || '').toLowerCase();

    const sellersReqs = allRequests
        .filter((r) => {
            const ownerEmail = r.propertyId?.owner?.email || r.property?.owner?.email;
            const legacySellerEmail = r.seller?.email;
            const normalizedOwnerEmail = String(ownerEmail || '').toLowerCase();
            const normalizedLegacyEmail = String(legacySellerEmail || '').toLowerCase();
            return normalizedOwnerEmail === normalizedSellerEmail || normalizedLegacyEmail === normalizedSellerEmail;
        })
        .map((r) => ({
            ...r,
            property: r.property || r.propertyId,
        }));

    return { data: { success: true, requests: sellersReqs } };
};

export const acceptRequest = (requestId) =>
    apiClient.put(`/api/requests/${requestId}`, { status: 'accepted' });

export const rejectRequest = (requestId) =>
    apiClient.put(`/api/requests/${requestId}`, { status: 'rejected' });

export const downloadRequestAgreement = (requestId) =>
    apiClient.get(`/api/requests/${requestId}/agreement`, {
        responseType: 'blob',
    });

// REAL API SERVICES (From develop branch)
export const getAllProperties = (params = {}) =>
    apiClient.get("/api/properties", { params });

export const createProperty = (payload) =>
    apiClient.post("/api/properties", payload);

export const updateProperty = (propertyId, payload) =>
    apiClient.put(`/api/properties/${propertyId}`, payload);

export const deleteProperty = (propertyId) =>
    apiClient.delete(`/api/properties/${propertyId}`);
