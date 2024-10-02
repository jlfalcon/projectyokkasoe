export default class Utils{
    static colors = [
        "#FFC352", 
        "#B95020", 
        "#F08858", 
        "#619542", 
        "#FBB79A", 
        "#C160B8", 
        //"#XXXXXXXXXXXXXX", 
        "#9c60c1", 
        "#6360c1", 
        "#60acc1", 
        "#60c19c", 
        "#8dc160", 
    ];

    static interpolateHexColor(colorStart, colorEnd, value) {
        // Helper function to convert hex to RGB
        function hexToRgb(hex) {
            const bigint = parseInt(hex.slice(1), 16);
            const r = (bigint >> 16) & 255;
            const g = (bigint >> 8) & 255;
            const b = bigint & 255;
            return [r, g, b];
        }
    
        // Helper function to convert RGB to hex
        function rgbToHex(r, g, b) {
            return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
        }
    
        // Ensure value is clamped between 0 and 1
        value = Math.min(1, Math.max(0, value));
    
        // Convert hex colors to RGB
        const startRGB = hexToRgb(colorStart);
        const endRGB = hexToRgb(colorEnd);
    
        // Interpolate each color channel
        const r = Math.round(startRGB[0] + (endRGB[0] - startRGB[0]) * value);
        const g = Math.round(startRGB[1] + (endRGB[1] - startRGB[1]) * value);
        const b = Math.round(startRGB[2] + (endRGB[2] - startRGB[2]) * value);
    
        // Convert back to hex and return
        return rgbToHex(r, g, b);
    }
    
    // Example usage:
    //console.log(interpolateHexColor("#FF0000", "#00FF00", 0.5)); // Returns: "#808000"
    
}