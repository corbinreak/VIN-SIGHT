import { apiKey } from "./config.js";

// AI Config
const GEMINI_API_KEY = apiKey;

// AI FUNCTION
async function getGeminiRpoCodes(year, make, model, engine, vin) {
    const MODEL_NAME = "gemini-2.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`

    const requestBody = {
        contents: [{
            parts: [{
                text: `### ROLE 
                  Act as a Master ASE-Certified Mechanic and Automotive Concierge.
                  
                  ### VEHICLE DATA 
                  - Year/Make/Model: ${year} ${make} ${model}
                  - Engine: ${engine}L
                  - VIN: ${vin}

                  ### TASK
                  Provide accurate technical specifications for this vehicle in three clear sections.

                  ### 1. Build Codes
                  List the 5-10 most common factory option codes.
                  Example (Honda): R18A (Engine Code), 5AT(automatic transmission), PW1 (Paint Code), G1U (Trim Code)
                  Example (GM): Z71 (Off-Road Suspension), L96 (6.2L V8), G80 (Limited Slip Diff), 1LZ (Interior Trim)
                  
                  
                  ## 2. Fluids Capacities & Specs
                  - Engine Oil: [Viscoity/Weight] (e.g., 5W-30)
                  - Oil Capacity: [Quarts/Liters with filter]
                  - Coolant Type: [e.g., Dex-cool, HOAT Blue]
                  - Transmission Fluid Type: [e.g., ATF+4, Dexron VI, ATF-Z1]

                  ### 3. Maintenance Quick-Tips
                  - Spark Plug Gap: [Inches/mm]
                  - Wheel Lug Torque: [Foot-pounds/Nm]
                  - Oil Filter Part Number: [Example: Napa Proformer Filters: (e.g, 2100164)]
                  - Tire Pressure: [PSI/kPa for front/rear]
                  - Oil Pan Drain Plug Size: [e.g., 17mm, 3/8" drive]
                  - OIl Drain Plug Thread Pitch: [e.g., 1.5mm, 16 TPI]
                  
                  ### Formatting Rules
                  - Use **Bold** for all labels.
                  - Use a bulledted list.
                  - If data is uncertain, say "Check Manual"
                  - End With a friendly reminder to consult the owner's manual for exact specs and maintenance intervals and before any service.
                  `
            }]
        }]
    }; 

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error("Gemini Error:", error);
        return "Could not retrieve factory RPO codes at this time.";
    }
}


// Grab vehicles vin from the DOM

document.getElementById("decodeBtn").addEventListener("click", () => {
    const vin = document.getElementById("vinInput").value;
    console.log("VIN:", vin);
    if(vin.length !== 17) {
        alert("Please enter a valid VIN number (17 characters).");
        return;
    }

    const rpoContainer = document.getElementById("rpoCodes");
    rpoContainer.innerHTML = "<p style='color: #888;'>Identifying vehicle...</p>"

    // Call the NHTSA API to get vehicle information
    fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${vin}?format=json`)
        .then(response => response.json())
        .then(async (data) => {
            const vehicle = data.Results[0];
            const engineSize = vehicle.DisplacementL ? parseFloat(vehicle.DisplacementL).toFixed(1) : 'N/A';

            // Map raw GVWR classes to more user-friendly weight categories

            const gvwrMapping = {
                "Class 1: 6,000 lb or less (2,722 kg or less)" :"Class 1(0-6k LBS)",
                "Class 1C: 4,001 - 5,000 lb (1,814 - 2,268 kg)" :"Class 1C (4k-5k LBS)",
                "Class 1D: 5,001 - 6,000 lb (2,268 - 2,722 kg)" :"Class 1D (5k-6k LBS)",


                "Class 2E: 6,001 - 7,000 lb (2,722 - 3,175 kg)" :"Class 2E (6k-7k LBS)",
                "Class 2F: 7,001 - 8,000 lb (3,176 - 3,629 kg)" :"Class 2F (7k-8k LBS)",
                "Class 2G: 8,001 - 9,000 lb (3,630 - 4,082 kg)" :"Class 2G (8k-9k LBS)",
                "Class 2H: 9,001 - 10,000 lb (4,083 - 4,536 kg)" :"Class 2H (9k-10k LBS)",

                "Class 3: 10,001 - 14,000 lb (4,537 - 6,350 kg)" :"Class 3 (10k-14k LBS)"
            }
            
            const rawGVWR = vehicle.GVWR || 'N/A';
            const displayWeight = gvwrMapping[rawGVWR] || rawGVWR || 'N/A';


            // Log the full vehicle data for debugging purposes

            console.log("Vehicle data from NHTSA API:", vehicle);
            document.getElementById('vehicleInfo').style.display = 'block';

            document.getElementById('carName').innerText = `${vehicle.ModelYear} ${vehicle.Make} ${vehicle.Model}`

            // Display more vehicle information as needed
            // Some examples may be null or empty, added a fallback to "N/A"

            document.getElementById('specEngine').innerText = `${engineSize}L ${vehicle.EngineConfiguration || 'N/A'}`;
            document.getElementById('specFuel').innerText = `${vehicle.FuelTypePrimary || 'N/A'}`;
            document.getElementById('specDrive').innerText = `${vehicle.DriveType || 'N/A'}`;
            document.getElementById('specCyl').innerText = `${vehicle.EngineCylinders || 'N/A'}`;
            document.getElementById('specTrans').innerText = `${vehicle.TransmissionStyle || 'N/A'}`;
            document.getElementById('specBody').innerText = `${vehicle.BodyClass || 'N/A'}`;
            document.getElementById('specGVWR').innerText = displayWeight;
            console.log("Full specs pulled from NHTSA API:", vehicle);

            // Call to Gemini API to get RPO codes and descriptions
            
             rpoContainer.innerHTML = "<p style='color: #ff3e3e;'>Consulting factory RPO records...</p>"

             const aiResult = await getGeminiRpoCodes(
                vehicle.ModelYear,
                vehicle.Make,
                vehicle.Model,
                engineSize,
                vin,
             );

             // Format Gemini Mark Down response to look better in the sidepanel
             
             const formattedResult = aiResult
                // 1. Convert Headers (### Section) to Bold Red headers
                 .replace(/^### (.*$)/gim, '<br><strong style="color: #ff3e3e; text-transform: uppercase; font-size: 11px;">$1</strong>')
            
                // 2. Convert Gemini's Double Bold (**Text**) to HTML Bold (<b>)
                .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>") 
            
                // 3. Convert Gemini's Single Bold/Italic (*Text*) to HTML Bold (<b>)
                .replace(/\*(.*?)\*/g, "<b>$1</b>") 
            
                // 4. Clean up bullet points to look better in the sidepanel
                .replace(/^\* /gim, "• ")
            
                // 5. Convert final newlines to line breaks
                .replace(/\n/g, "<br>");
             
             console.log("Raw Gemini response:", aiResult);
             console.log("Formatted Gemini response:", formattedResult);

             // Ai response is now formatted with HTML tags, we can safely inject it into the sidepanel
             
             rpoContainer.innerHTML = `
             <div style="margin-top: 15px; border-top: 1px solid #444; padding-top: 10px;">
                <h4 style="color: #ff3e3e; margin: 0 0 10px 0; font-size: 12px;">Vehicle Information (Powered by Gemini AI)</h4>
                <div style="font-size: 13px; color: #bbb; line-height: 1.4;">${formattedResult}</div>
            </div>
            `;
        })
        // Error handling for NHTSA API call
        .catch(error => {
            console.error("NHTSA error:", error);
            rpoContainer.innerHTML = "Error decoding VIN.";
        });
        console.log("VIN decoding process initiated for:", vin);
})