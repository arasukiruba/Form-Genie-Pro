/**
 * Fetches the HTML content of a URL using public CORS proxies.
 * Tries multiple proxies to ensure reliability.
 */
export const fetchUrlContent = async (url: string): Promise<string> => {
  let targetUrl = url.trim();
  
  // Ensure protocol exists
  if (!targetUrl.toLowerCase().startsWith('http')) {
    targetUrl = 'https://' + targetUrl;
  }

  // Helper to wait/timeout if a request hangs
  const fetchWithTimeout = async (resource: string, options: RequestInit = {}) => {
    const { timeout = 15000 } = options as any;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(resource, {
        ...options,
        signal: controller.signal  
      });
      clearTimeout(id);
      return response;
    } catch (err) {
      clearTimeout(id);
      throw err;
    }
  };

  // Array of proxy URL generators
  // 1. CodeTabs - Very reliable for simple GETs
  // 2. AllOrigins - Reliable fallback
  // 3. CorsProxy.io - Fast, sometimes blocks Google Forms
  const proxyGenerators = [
    (u: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,
    (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
    (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}`
  ];

  for (const generateProxyUrl of proxyGenerators) {
    try {
      const proxyUrl = generateProxyUrl(targetUrl);
      const response = await fetchWithTimeout(proxyUrl);
      
      if (!response.ok) {
        console.warn(`Proxy ${proxyUrl} failed with status ${response.status}`);
        continue;
      }
      
      const text = await response.text();
      
      // Basic validation to ensure we got HTML and not an error page or empty response
      // Google Forms always contain "FB_PUBLIC_LOAD_DATA_"
      if (text && text.length > 500 && (text.includes('FB_PUBLIC_LOAD_DATA_') || text.includes('docs.google.com/forms'))) {
        return text;
      } else {
        console.warn("Fetched content did not appear to be a valid Google Form.");
      }
    } catch (error: any) {
      console.warn(`Proxy attempt failed for ${targetUrl}:`, error);
      // Continue to next proxy
    }
  }

  throw new Error(
    "Unable to fetch the form automatically due to browser security restrictions (CORS). Please use the 'Source HTML' tab: Open your form in a new tab, right-click > 'View Page Source', copy everything, and paste it here."
  );
};