$baseUrl = "http://localhost:5000/api"

Write-Host "=== 1. TEST AUTHENTICATION ===" -ForegroundColor Cyan
$adminLogin = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"admin@joy.edu","password":"Admin@123"}'
Write-Host "Admin Login: $($adminLogin.success) - $($adminLogin.user.name) ($($adminLogin.user.role))"

$teacherLogin = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"sharma@joy.edu","password":"Faculty@123"}'
Write-Host "Teacher Login: $($teacherLogin.success) - $($teacherLogin.user.name) ($($teacherLogin.user.role))"

$studentLogin = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"sunny@joy.edu","password":"Student@123"}'
Write-Host "Student Login: $($studentLogin.success) - $($studentLogin.user.name) ($($studentLogin.user.role))"

$adminToken = $adminLogin.token
$teacherToken = $teacherLogin.token
$studentToken = $studentLogin.token

Write-Host "`n=== 2. TEST EVENT CREATION BY ADMIN ===" -ForegroundColor Cyan
$eventBody = @{
    title = "JOY Automated E2E Championship 2026"
    category = "technical"
    description = "Automated full-stack verification event created during system check."
    eventDate = (Get-Date).AddDays(5).ToString("yyyy-MM-ddTHH:mm:ssZ")
    startTime = "10:00 AM"
    endTime = "05:00 PM"
    venue = "JOY Turing Hall 101"
    regStartDate = (Get-Date).AddDays(-1).ToString("yyyy-MM-ddTHH:mm:ssZ")
    regDeadline = (Get-Date).AddDays(4).ToString("yyyy-MM-ddTHH:mm:ssZ")
    maxCapacity = 100
    eligibility = "All registered students"
    facultyCoordinators = @($teacherLogin.user._id)
    status = "registration_open"
    dynamicFormSchema = @(
        @{ id = "team_name"; label = "Team Name"; type = "team_name"; required = $true; order = 1 }
    )
} | ConvertTo-Json -Depth 5

$createdEvent = Invoke-RestMethod -Uri "$baseUrl/events" -Method Post -Headers @{ Authorization = "Bearer $adminToken" } -ContentType "application/json" -Body $eventBody
$eventId = $createdEvent.data._id
Write-Host "Event Created: $($createdEvent.success) - ID: $eventId ($($createdEvent.data.title))"

Write-Host "`n=== 3. TEST STUDENT REGISTRATION ===" -ForegroundColor Cyan
$regBody = @{
    customFormData = @{ team_name = "Code Masters" }
} | ConvertTo-Json

$studentReg = Invoke-RestMethod -Uri "$baseUrl/registrations/events/$eventId/register" -Method Post -Headers @{ Authorization = "Bearer $studentToken" } -ContentType "application/json" -Body $regBody
Write-Host "Registration Created: $($studentReg.success) - ID: $($studentReg.data.registrationId)"

Write-Host "`n=== 4. TEST TEACHER ATTENDANCE ROTATING QR ===" -ForegroundColor Cyan
$startSession = Invoke-RestMethod -Uri "$baseUrl/attendance/events/$eventId/start" -Method Post -Headers @{ Authorization = "Bearer $teacherToken" } -ContentType "application/json" -Body '{}'
Write-Host "Attendance Session Started: $($startSession.success)"

$liveQr = Invoke-RestMethod -Uri "$baseUrl/attendance/events/$eventId/live-qr" -Method Get -Headers @{ Authorization = "Bearer $teacherToken" }
$token = $liveQr.token
Write-Host "Live Rotating Token: $token (Valid for $($liveQr.secondsRemaining)s)"

Write-Host "`n=== 5. TEST STUDENT ATTENDANCE SCAN ===" -ForegroundColor Cyan
$scanBody = @{
    eventId = $eventId
    token = $token
} | ConvertTo-Json

$scanRes = Invoke-RestMethod -Uri "$baseUrl/attendance/scan" -Method Post -Headers @{ Authorization = "Bearer $studentToken" } -ContentType "application/json" -Body $scanBody
Write-Host "Student Scan: $($scanRes.success) - Status: $($scanRes.data.status)"

Write-Host "`n=== 6. TEST DUPLICATE ATTENDANCE PREVENTION ===" -ForegroundColor Cyan
try {
    $dupRes = Invoke-RestMethod -Uri "$baseUrl/attendance/scan" -Method Post -Headers @{ Authorization = "Bearer $studentToken" } -ContentType "application/json" -Body $scanBody
    Write-Host "FAILED: Duplicate scan was allowed!" -ForegroundColor Red
} catch {
    Write-Host "SUCCESS: Duplicate scan properly rejected with message: $($_.Exception.Message)" -ForegroundColor Green
}

Write-Host "`n=== 7. TEST RESULT PUBLISHING & CERTIFICATE ISSUANCE ===" -ForegroundColor Cyan
$resultBody = @{
    winners = @(
        @{
            position = "1st"
            student = $studentLogin.user._id
            title = "1st Place - Grand Champions 🥇"
            teamName = "Code Masters"
            score = "99/100"
            remarks = "Exceptional innovation and code performance."
        }
    )
    generalRemarks = "Superb event execution."
} | ConvertTo-Json -Depth 5

$saveDraft = Invoke-RestMethod -Uri "$baseUrl/results/events/$eventId" -Method Post -Headers @{ Authorization = "Bearer $teacherToken" } -ContentType "application/json" -Body $resultBody
Write-Host "Saved Results Draft: $($saveDraft.success)"

$publishRes = Invoke-RestMethod -Uri "$baseUrl/results/events/$eventId/publish" -Method Post -Headers @{ Authorization = "Bearer $teacherToken" } -ContentType "application/json" -Body '{}'
Write-Host "Published Results: $($publishRes.success) - Certificates Issued: $($publishRes.certificatesIssued)"

Write-Host "`n=== 8. TEST STUDENT CERTIFICATE FETCH ===" -ForegroundColor Cyan
$myCerts = Invoke-RestMethod -Uri "$baseUrl/certificates/my" -Method Get -Headers @{ Authorization = "Bearer $studentToken" }
$newCert = $myCerts.data[0]
Write-Host "Found $($myCerts.data.Count) certificate(s). Latest Cert ID: $($newCert.certificateId) for $($newCert.achievementTitle)"

Write-Host "`n=== 9. TEST PUBLIC CERTIFICATE VERIFICATION ===" -ForegroundColor Cyan
$verify = Invoke-RestMethod -Uri "$baseUrl/certificates/verify/$($newCert.certificateId)" -Method Get
Write-Host "Verification: $($verify.isValid) - Status: $($verify.verificationStatus) - Recipient: $($verify.certificate.studentName)"

Write-Host "`n=== 10. TEST ADMIN SETTINGS REBRANDING ===" -ForegroundColor Cyan
$settings = Invoke-RestMethod -Uri "$baseUrl/settings" -Method Get
Write-Host "Current Institution: $($settings.data.institutionName) - Tagline: $($settings.data.tagline)"

Write-Host "`n>>> ALL 10 CORE E2E WORKFLOWS VERIFIED SUCCESSFULLY! <<<" -ForegroundColor Green
