from pydantic import BaseModel
from typing import Optional, List


class ExtractedFields(BaseModel):
    # Policy Information
    policy_number: Optional[str] = None
    policyholder_name: Optional[str] = None
    effective_dates: Optional[str] = None

    # Incident Information
    incident_date: Optional[str] = None
    incident_time: Optional[str] = None
    incident_location: Optional[str] = None
    incident_description: Optional[str] = None

    # Involved Parties
    claimant_name: Optional[str] = None
    third_parties: Optional[List[str]] = None
    contact_details: Optional[str] = None

    # Asset Details
    asset_type: Optional[str] = None
    asset_id: Optional[str] = None
    estimated_damage: Optional[float] = None

    # Other Mandatory Fields
    claim_type: Optional[str] = None
    attachments: Optional[List[str]] = None
    initial_estimate: Optional[float] = None


class FNOLResponse(BaseModel):
    extractedFields: dict
    missingFields: List[str]
    recommendedRoute: str
    reasoning: str