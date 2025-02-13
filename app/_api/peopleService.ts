import { path } from "./api-paths";
import {
  generateAuthenticatedRequest,
  generateRequest,
} from "../_utils/requests";
import { People } from "../_models/People";

const peopleTemplateUrl: string = path.PEOPLE_ENDPOINT;

export async function getPerson(id: string): Promise<People> {
  return generateRequest<People>(`${peopleTemplateUrl}/${id}`, "GET", {}).then(
    (r) => r
  );
}

export async function getPeople(): Promise<People> {
  return generateRequest<People>(`${peopleTemplateUrl}`, "GET", {}).then(
    (r) => r
  );
}
