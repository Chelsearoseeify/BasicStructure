import { DEFAULT_BASE_URL } from "../_api/api-paths";
import { Page } from "../_models/Page";

type Method = "POST" | "GET" | "PUT" | "PATCH" | "DELETE";
type QueryParams = Record<string, string | number | boolean>;
type BodyParams = Record<string, unknown>;

/**
 * Error to signal a response with a non succesful status code.
 */
export class StatusError extends Error {
  status: number;
  is401: boolean = false;
  is404: boolean = false;
  is409: boolean = false;
  is503: boolean = false;

  constructor(status: number, text: string) {
    super(text);
    this.status = status;
    this.is401 = status === 401;
    this.is404 = status === 404;
    this.is409 = status === 409;
    this.is503 = status === 503;
  }
}

/**
 * Error to signal problems relative to the communication with akamas services.
 * Such problems may be any problem that arises while trying to get a succesfully parsed json body:
 * it might be a connection timeout problem, or a problem caused by a non parsable body
 */
export class ConnectionError extends Error {}

export async function generateAuthenticatedRequest(
  url: string,
  method: Method,
  params: QueryParams = {},
  body?: BodyParams,
  asForm = false
): Promise<any> {
  const token = "";

  if (!token) {
    console.error("could not find access_token");
    window.location.reload();
  }
  return generateRequest(url, method, params, token, body, asForm);
}

/**
 * Convert an object into URL query parameters using URLSearchParams.
 */
function objectToSearchParams(
  params: Record<string, unknown>
): URLSearchParams {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    // You might need more advanced logic if value can be arrays/objects
    // This handles value as a simple string/number/boolean
    searchParams.append(key, String(value));
  });
  return searchParams;
}

function buildFullUrl(url: string): string {
  // If it's already absolute, return as-is
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  // Otherwise, append it to the default base
  // Remove any leading slash so we don't get double slashes
  return `${DEFAULT_BASE_URL}/${url.replace(/^\/+/, "")}`;
}

/**
 * Generates an HTTP request to an Akamas service.
 *
 * @param url     The target URL.
 * @param method  The HTTP method to be used (GET, POST, PUT, etc.).
 * @param params  Query params for the request (will be appended to the URL).
 * @param token   Optional authorization token (Bearer).
 * @param body    The body of the request.
 * @param asForm  Whether the body should be sent as form data instead of JSON.
 */
export async function generateRequest<T = unknown>(
  url: string,
  method: Method,
  params: QueryParams = {},
  token?: string,
  body?: BodyParams,
  asForm = false
): Promise<T> {
  const baseUrl = buildFullUrl(url);
  // Build query string if necessary
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    searchParams.append(key, String(value));
  });

  const requestUrl = searchParams.toString()
    ? `${baseUrl}?${searchParams}`
    : baseUrl;

  const headers: HeadersInit = {
    Accept: "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if ((method === "POST" || method === "PUT") && !body) {
    throw new TypeError("A body for the POST/PUT request was not provided");
  }

  // If it's JSON, set the Content-Type header
  if (!asForm && (method === "POST" || method === "PUT")) {
    headers["Content-Type"] = "application/json; charset=utf-8";
  }

  const requestInit: RequestInit = {
    method,
    headers,
    mode: "cors",
  };

  if (body) {
    if (asForm) {
      // Convert the body to form-encoded data
      requestInit.body = new URLSearchParams(
        Object.entries(body).map(([k, v]) => [k, String(v)])
      );
    } else {
      requestInit.body = JSON.stringify(body);
    }
  }
  console.log(requestInit);
  const response = await fetch(requestUrl, requestInit);

  // Handle response errors
  if (!response.ok) {
    // Attempt to parse JSON error response; fallback to status text
    const errorBody = await response.json().catch(() => ({
      message: response.statusText,
    }));

    if (response.status === 401) {
      console.error("Unauthorized request, redirecting to login");
      // clearKeycloakTokensCookies(); // If you have such logic
      window.location.reload();
    }

    const description =
      response.status === 401
        ? errorBody.error?.message ?? errorBody.error_description
        : errorBody.message;

    throw new StatusError(response.status, description);
  }

  return handleResponse<T>(response);
}

/**
 * A small helper to handle different response types (JSON, text, blob, etc.).
 */
async function handleResponse<T>(response: Response): Promise<T> {
  const contentTypeHeader = response.headers.get("Content-Type") ?? "";
  const contentDispositionHeader = response.headers.get("content-disposition");

  if (contentTypeHeader.includes("application/json")) {
    return response.json();
  }

  if (contentDispositionHeader?.includes("attachment")) {
    // If you want to automatically trigger download:
    const blob = await response.blob();
    const link = document.createElement("a");
    const resourceUrl = URL.createObjectURL(blob);
    link.href = resourceUrl;

    // Try to extract filename from content-disposition
    const filenameMatch = contentDispositionHeader.match(/filename=(.*)/);
    const filename = filenameMatch ? filenameMatch[1] : "download.dat";
    link.setAttribute("download", filename);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return undefined as T;
  }

  // Fallback: attempt to parse as text
  return (await response.text()) as T;
}

export async function unrollPages<T>(
  fetcher: (page: number, size: number) => Promise<Page<T>>,
  pageNumber: number,
  pageSize: number
): Promise<T[]> {
  let currentPageNumber = pageNumber;
  let currentPage;
  const content: T[] = [];
  while (!currentPage?.last) {
    currentPage = await fetcher(currentPageNumber, pageSize);
    currentPage.content.forEach((item) => content.push(item));
    currentPageNumber += 1;
  }
  return content;
}
