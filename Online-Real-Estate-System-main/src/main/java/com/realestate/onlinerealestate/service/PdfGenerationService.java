package com.realestate.onlinerealestate.service;

import com.itextpdf.html2pdf.HtmlConverter;
import com.realestate.onlinerealestate.model.LoanApplication;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Service
public class PdfGenerationService {

    public byte[] generateLoanAgreementPdf(LoanApplication loan) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        String htmlContent = generateAgreementHtml(loan);

        HtmlConverter.convertToPdf(htmlContent, outputStream);

        return outputStream.toByteArray();
    }

    private String generateAgreementHtml(LoanApplication loan) {
        String html = "<!DOCTYPE html><html><head><style>" +
                "body { font-family: 'Helvetica', 'Arial', sans-serif; line-height: 1.6; padding: 40px; color: #333; }"
                +
                "h1 { color: #0056b3; text-align: center; border-bottom: 2px solid #0056b3; padding-bottom: 10px; }" +
                "h2 { color: #333; margin-top: 30px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }" +
                "table { width: 100%; border-collapse: collapse; margin-top: 20px; }" +
                "th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }" +
                "th { background-color: #f8f9fa; font-weight: bold; width: 40%; }" +
                ".terms { margin-top: 30px; font-size: 14px; text-align: justify; }" +
                ".signature-section { margin-top: 60px; display: flex; justify-content: space-between; page-break-inside: avoid; }"
                +
                ".signature-box { width: 45%; text-align: center; border-top: 1px solid #000; padding-top: 10px; margin-top: 50px; float: left;}"
                +
                ".signature-box-right { width: 45%; text-align: center; border-top: 1px solid #000; padding-top: 10px; margin-top: 50px; float: right;}"
                +
                ".clearfix::after { content: ''; clear: both; display: table; }" +
                "</style></head><body>" +
                "<h1>LOAN AGREEMENT</h1>" +
                "<p>This Loan Agreement (the \"Agreement\") is entered into on <strong>" + java.time.LocalDate.now()
                + "</strong> by and between EstateHub Financial Services (the \"Lender\") and the borrower detailing below (the \"Borrower\").</p>"
                +

                "<h2>1. Borrower Details</h2>" +
                "<table>" +
                "<tr><th>Full Name</th><td>" + loan.getFullName() + "</td></tr>" +
                "<tr><th>Email Address</th><td>" + loan.getEmail() + "</td></tr>" +
                "<tr><th>Mobile Number</th><td>" + loan.getMobile() + "</td></tr>" +
                "<tr><th>PAN Number</th><td>" + (loan.getPanNumber() != null ? loan.getPanNumber() : "N/A")
                + "</td></tr>" +
                "<tr><th>Employment Type</th><td>" + loan.getEmploymentType() + "</td></tr>" +
                "<tr><th>Annual Income</th><td>₹" + loan.getAnnualIncome() + "</td></tr>" +
                "</table>" +

                "<h2>2. Loan Details</h2>" +
                "<table>" +
                "<tr><th>Application ID</th><td>#" + loan.getId() + "</td></tr>" +
                "<tr><th>Property City</th><td>" + loan.getPropertyCity() + "</td></tr>" +
                "<tr><th>Principal Loan Amount</th><td>₹" + loan.getLoanAmount() + "</td></tr>" +
                "<tr><th>Tenure</th><td>" + loan.getTenureYears() + " Years (" + (loan.getTenureYears() * 12)
                + " Months)</td></tr>" +
                "<tr><th>Disbursement Bank</th><td>" + loan.getSelectedBank() + "</td></tr>" +
                "<tr><th>Bank Account Number</th><td>" + loan.getBankAccountNumber() + "</td></tr>" +
                "<tr><th>IFSC Code</th><td>" + loan.getBankIfscCode() + "</td></tr>" +
                "</table>" +

                "<h2>3. Terms and Conditions</h2>" +
                "<div class='terms'>" +
                "<p><strong>3.1 Repayment:</strong> The Borrower agrees to repay the Principal Loan Amount along with applicable interest in Equated Monthly Installments (EMIs) over the specified Tenure. The EMIs shall be paid on or before the due date as per the provided schedule.</p>"
                +
                "<p><strong>3.2 Interest:</strong> Interest on the loan will be charged as per the prevailing rates set by EstateHub Financial Services at the time of disbursement. The interest is calculated on a monthly reducing balance basis.</p>"
                +
                "<p><strong>3.3 Default:</strong> In the event of failure to pay any EMI by the due date, the Borrower shall be liable to pay penal interest and late payment charges as determined by the Lender.</p>"
                +
                "<p><strong>3.4 Prepayment:</strong> The Borrower may prepay the loan in full or in part, subject to prepayment charges (if applicable) as per the Lender's policy.</p>"
                +
                "<p><strong>3.5 Security:</strong> The loan is secured against the property being purchased or constructed. The Borrower agrees not to sell, transfer, or create any encumbrance on the property without the prior written consent of the Lender.</p>"
                +
                "</div>" +

                "<div class='signature-section clearfix'>" +
                "<div class='signature-box'>" +
                "<strong>EstateHub Financial Services</strong><br/>(Authorized Signatory)" +
                "</div>" +
                "<div class='signature-box-right'>" +
                "<strong>" + loan.getFullName() + "</strong><br/>(Borrower)" +
                "</div>" +
                "</div>" +

                "</body></html>";

        return html;
    }
}
