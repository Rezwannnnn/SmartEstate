import apiClient from "./apiClient";

const MOCK_PROPERTIES = [
    {
        _id: "p1", title: "Luxury Modern Villa", price: 6500000,
        location: "Gulshan", type: "Villa", bedrooms: 4,
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800",
        sellerName: "Test Seller", sellerEmail: "seller@example.com", status: "available"
    },
    {
        _id: "p2", title: "Cozy 2BHK Apartment", price: 45000,
        location: "Banani", type: "Apartment", bedrooms: 2,
        image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",
        sellerName: "Test Seller", sellerEmail: "seller@example.com", status: "available"
    },
    {
        _id: "p3", title: "Central Urban Condo", price: 1200000,
        location: "Dhanmondi", type: "Apartment", bedrooms: 3,
        image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80",
        sellerName: "Other Seller", sellerEmail: "other@example.com", status: "available"
    }
];

// Helper to get local mock data
const getMockProps = () => {
    let properties = JSON.parse(localStorage.getItem("mock_properties"));
    if (!properties || properties.length === 0) {
        properties = MOCK_PROPERTIES;
        localStorage.setItem("mock_properties", JSON.stringify(properties));
    }
    return properties;
};

// PRIMARY: Call real backend filter route. Fallback to mock if backend is offline.
export const filterProperties = async (filters = {}) => {
    try {
        // Build payload matching what propertyController.getFilterProperty expects
        const payload = {};
        if (filters.location) payload.location = filters.location;
        if (filters.type) payload.type = filters.type;
        if (filters.bedrooms) payload.bedrooms = Number(filters.bedrooms);
        if (filters.min_price !== undefined) payload.min_price = Number(filters.min_price);
        if (filters.max_price !== undefined) payload.max_price = Number(filters.max_price);

        const res = await apiClient.post('/api/properties/filter', payload);
        return res; // { data: { success, count, properties } }
    } catch (err) {
        // Backend offline or returned 404 (no results) — fall back to mock
        console.warn('Backend unavailable, using mock data:', err.message);
        let properties = getMockProps();
        let results = properties;
        if (filters.location) results = results.filter(p => p.location.toLowerCase() === filters.location.toLowerCase());
        if (filters.type) results = results.filter(p => p.type.toLowerCase() === filters.type.toLowerCase());
        if (filters.bedrooms) results = results.filter(p => p.bedrooms === Number(filters.bedrooms));
        if (filters.min_price !== undefined) results = results.filter(p => p.price >= filters.min_price);
        if (filters.max_price !== undefined) results = results.filter(p => p.price <= filters.max_price);
        return { data: { success: true, count: results.length, properties: results } };
    }
};


export const getPropertyById = async (id) => {
    let properties = getMockProps();
    let prop = properties.find(p => p._id === id);
    if (prop) return { data: { success: true, property: prop } };

    // Fallback to real API if mock not found
    return apiClient.get(`/api/properties/${id}`);
};

export const sendBuyRequest = async (payload) => {
    let requests = JSON.parse(localStorage.getItem("mock_requests")) || [];
    let properties = getMockProps();
    let prop = properties.find(p => p._id === payload.propertyId);

    const newReq = {
        _id: "req_" + Date.now(),
        property: prop,
        buyer: { name: payload.buyerName, email: payload.buyerEmail, phone: payload.buyerPhone },
        message: payload.message,
        status: "pending"
    };
    requests.push(newReq);
    localStorage.setItem("mock_requests", JSON.stringify(requests));
    return { data: { success: true } };
};

export const getSellerRequests = async (sellerEmail) => {
    // Step 1: try seller-specific API.
    try {
        const res = await apiClient.get(`/api/requests/seller/${encodeURIComponent(sellerEmail)}`);
        const hasRequests = Array.isArray(res.data?.requests) && res.data.requests.length > 0;
        if (res.data?.success && hasRequests) {
            return res;
        }
    } catch (err) {
        console.warn('Seller-specific endpoint unavailable, trying all requests:', err.message);
    }

    // Step 2: if empty, get all requests and match seller email here.
    try {
        const allRes = await apiClient.get('/api/requests');
        const allRequests = Array.isArray(allRes.data) ? allRes.data : [];
        const normalizedSellerEmail = String(sellerEmail || '').toLowerCase();
        const sellersReqs = allRequests
            .filter((r) => {
                const ownerEmail = r.propertyId?.owner?.email || r.property?.owner?.email;
                const legacySellerEmail = r.seller?.email;
                // Old data may miss seller email, so keep it visible.
                if (!ownerEmail && !legacySellerEmail) {
                    return true;
                }

                const normalizedOwnerEmail = String(ownerEmail || '').toLowerCase();
                const normalizedLegacyEmail = String(legacySellerEmail || '').toLowerCase();
                return normalizedOwnerEmail === normalizedSellerEmail || normalizedLegacyEmail === normalizedSellerEmail;
            })
            .map((r) => ({
                ...r,
                property: r.property || r.propertyId,
            }));

        if (sellersReqs.length > 0) {
            return { data: { success: true, requests: sellersReqs } };
        }
    } catch (nestedErr) {
        console.warn('Backend seller requests unavailable, using mock data:', nestedErr.message);
    }

    // Step 3: if backend is not usable, use local mock data.
    let requests = JSON.parse(localStorage.getItem("mock_requests")) || [];
    let sellersReqs = requests.filter(r => r.property?.sellerEmail === sellerEmail);
    return { data: { success: true, requests: sellersReqs } };
};

export const acceptRequest = async (requestId) => {
    // Try backend first so real status update and email can happen.
    try {
        return await apiClient.put(`/api/requests/${requestId}`, { status: 'accepted' });
    } catch (err) {
        console.warn('Backend accept failed, using mock data:', err.message);
    }

    // If backend fails, update local mock data.
    let requests = JSON.parse(localStorage.getItem("mock_requests")) || [];
    let req = requests.find(r => r._id === requestId);
    if (req) {
        req.status = 'accepted';
        let properties = getMockProps();
        let prop = properties.find(p => p._id === req.property._id);
        if (prop) prop.status = "sold";
        localStorage.setItem("mock_properties", JSON.stringify(properties));
        localStorage.setItem("mock_requests", JSON.stringify(requests));
    }
    return { data: { success: true } };
};

export const rejectRequest = async (requestId) => {
    // Try backend first so real status update and email can happen.
    try {
        return await apiClient.put(`/api/requests/${requestId}`, { status: 'rejected' });
    } catch (err) {
        console.warn('Backend reject failed, using mock data:', err.message);
    }

    // If backend fails, update local mock data.
    let requests = JSON.parse(localStorage.getItem("mock_requests")) || [];
    let req = requests.find(r => r._id === requestId);
    if (req) {
        req.status = 'rejected';
        localStorage.setItem("mock_requests", JSON.stringify(requests));
    }
    return { data: { success: true } };
};

// REAL API SERVICES (From develop branch)
export const getAllProperties = (params = {}) =>
    apiClient.get("/api/properties", { params });

export const createProperty = (payload) =>
    apiClient.post("/api/properties", payload);
