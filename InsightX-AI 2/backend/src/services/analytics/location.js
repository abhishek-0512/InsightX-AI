const findColumn = (headers, keywords) => {
    return headers.find((header) => {
        const name = header.toLowerCase().replace(/\s+/g, "_");

        return keywords.some((keyword) => name.includes(keyword));
    });
};

exports.analyze = (rows = []) => {

    if (!rows.length) return {};

    const headers = Object.keys(rows[0]);

    const cityColumn = findColumn(headers, [
        "city",
        "location",
        "town"
    ]);

    const stateColumn = findColumn(headers, [
        "state",
        "province",
        "region"
    ]);

    const countryColumn = findColumn(headers, [
        "country",
        "nation"
    ]);

    const pincodeColumn = findColumn(headers, [
        "pincode",
        "zipcode",
        "postal",
        "postal_code"
    ]);

    const result = {
        available: false,
        cities: {},
        states: {},
        countries: {},
        pincodes: {}
    };

    if (
        !cityColumn &&
        !stateColumn &&
        !countryColumn &&
        !pincodeColumn
    ) {
        return result;
    }

    result.available = true;

    rows.forEach((row) => {

        if (cityColumn) {
            const city = String(row[cityColumn] || "Unknown").trim();

            result.cities[city] =
                (result.cities[city] || 0) + 1;
        }

        if (stateColumn) {
            const state = String(row[stateColumn] || "Unknown").trim();

            result.states[state] =
                (result.states[state] || 0) + 1;
        }

        if (countryColumn) {
            const country = String(row[countryColumn] || "Unknown").trim();

            result.countries[country] =
                (result.countries[country] || 0) + 1;
        }

        if (pincodeColumn) {
            const pin = String(row[pincodeColumn] || "Unknown").trim();

            result.pincodes[pin] =
                (result.pincodes[pin] || 0) + 1;
        }

    });

    const sortObject = (obj) =>
        Object.fromEntries(
            Object.entries(obj).sort((a, b) => b[1] - a[1])
        );

    result.cities = sortObject(result.cities);
    result.states = sortObject(result.states);
    result.countries = sortObject(result.countries);
    result.pincodes = sortObject(result.pincodes);

    result.topCity = Object.entries(result.cities)[0] || null;
    result.topState = Object.entries(result.states)[0] || null;
    result.topCountry = Object.entries(result.countries)[0] || null;

    return result;
};