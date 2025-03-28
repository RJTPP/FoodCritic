import enum

# Enum for report_status in the Reports table
class ReportStatusEnum(str, enum.Enum):
    pending = 'pending'
    reviewed = 'reviewed'
    resolved = 'resolved'

class RoleEnum(str, enum.Enum):
    user = 'user'
    owner = 'owner'
    admin = 'admin'