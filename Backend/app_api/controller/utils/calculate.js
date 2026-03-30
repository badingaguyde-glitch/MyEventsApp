
const calculateDistance = (lat1, lon1, lat2, lon2, unit = 'km') => {
    if (!lat1 || !lon1 || !lat2 || !lon2) {
        throw new Error('Invalid coordinates provided');
    }

    const R = unit === 'km' ? 6371 : 3959; // Earth's radius in km or miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance;
};

module.exports = { calculateDistance };