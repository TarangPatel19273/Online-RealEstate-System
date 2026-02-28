import React, { useState } from 'react';
import Navbar from './Navbar';

const DocumentsInfo = () => {
    const [activeTab, setActiveTab] = useState('Agricultural');
    const [selectedDocument, setSelectedDocument] = useState(null);

    const containerStyle = {
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '20px',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    };

    const headerStyle = {
        textAlign: 'center',
        marginBottom: '40px',
        color: '#333'
    };

    const tabContainerStyle = {
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '30px',
        gap: '20px'
    };

    const tabStyle = (isActive) => ({
        padding: '12px 24px',
        fontSize: '18px',
        fontWeight: '600',
        border: 'none',
        borderBottom: isActive ? '3px solid #0078db' : '3px solid transparent',
        background: 'none',
        color: isActive ? '#0078db' : '#666',
        cursor: 'pointer',
        transition: 'all 0.3s'
    });

    const contentStyle = {
        background: '#fff',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    };

    const sectionTitleStyle = {
        color: '#2c3e50',
        borderBottom: '2px solid #eee',
        paddingBottom: '10px',
        marginBottom: '20px'
    };

    const listItemStyle = {
        marginBottom: '15px',
        lineHeight: '1.6',
        fontSize: '16px',
        color: '#444'
    };

    const sampleDocumentStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginTop: '30px',
        paddingTop: '30px',
        borderTop: '2px solid #eee'
    };

    const documentCardStyle = {
        border: '1px solid #ddd',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'transform 0.3s, box-shadow 0.3s',
        cursor: 'pointer'
    };

    const documentImageStyle = {
        width: '100%',
        height: '200px',
        backgroundColor: '#f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#999'
    };

    const documentNameStyle = {
        padding: '15px',
        backgroundColor: '#fff',
        borderTop: '1px solid #eee'
    };

    const modalStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: selectedDocument ? 'flex' : 'none',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
    };

    const modalContentStyle = {
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '40px',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
    };

    const closeButtonStyle = {
        float: 'right',
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#999',
        cursor: 'pointer',
        border: 'none',
        background: 'none',
        padding: '0',
        width: '30px',
        height: '30px'
    };

    const documentSamples = {
        '7/12_Extract': {
            title: '7/12 Extract (Satbara Utara)',
            category: 'Agricultural Document',
            description: 'This is the most important document for agricultural land. It proves ownership and provides details about:',
            details: [
                '• Survey Number: Unique identification number for the land',
                '• Area: Total land area in acres/hectares',
                '• Owner Name: Name of the current land owner',
                '• Land Value: Assessed value for tax purposes',
                '• Crop Pattern: Current crops grown on the land',
                '• Irrigation Status: Whether land is irrigated or not'
            ],
            sample: `SAMPLE 7/12 EXTRACT\n\nSurvey-No: 456/A\nArea: 2.50 Acres\nOwner: Raj Kumar Singh\nVillage: Nashik\nTaluka: Niphad\nDistrict: Nashik\nState: Maharashtra\n\nIssued by: Revenue Department\nDate: 01-Jan-2024`
        },
        '8A_Extract': {
            title: '8A Extract',
            category: 'Land Holding Details',
            description: 'Shows the total land holding of the owner in the village. Validates ownership mentioned in 7/12 extract.',
            details: [
                '• Total Holding: Complete land owned in the village',
                '• Plot Division: Individual plot details',
                '• Sub-divisions: Any subdivided plots',
                '• Consolidation Status: Land consolidation records',
                '• Total Cultivable Area: Area suitable for cultivation'
            ],
            sample: `SAMPLE 8A EXTRACT\n\nVillage: Nashik\nOwner: Raj Kumar Singh\nTotal Holding: 5.00 Acres\n\nPlot Details:\n- Plot 1: 2.50 Acres\n- Plot 2: 1.50 Acres\n- Plot 3: 1.00 Acres\n\nIssued by: Revenue Department`
        },
        'Farfar': {
            title: 'Farfar (Mutation Entry)',
            category: 'Transfer History',
            description: 'Records the complete transfer history of land ownership. Critical for verifying legitimate ownership chain.',
            details: [
                '• Previous Owner: Name of prior owner',
                '• Transfer Date: When ownership changed',
                '• Method: Sale, Gift, Inheritance, etc.',
                '• Transfer Value: Amount paid in transfer',
                '• Witness Details: Names of witnesses to the transfer'
            ],
            sample: `SAMPLE FARFAR (MUTATION ENTRY)\n\nSurvey-No: 456/A\n\nTransfer History:\n\n1. Grandfather: Shankar Singh (1980-2000)\n2. Father: Mohan Singh (2000-2015)\n3. Current Owner: Raj Kumar Singh (2015-Present)\n\nTransfer Type: Inheritance\nDate: 15-March-2015`
        },
        '6/12_Extract': {
            title: '6/12 Extract (Hakkajapti Patrak)',
            category: 'Disputed Land Records',
            description: 'Required for disputed lands or lands with specific legal conditions. Shows rights and restrictions.',
            details: [
                '• Rights on Land: Ownership and usage rights',
                '• Restrictions: Any legal restrictions',
                '• Liabilities: Mortgages or debts on land',
                '• Lease Details: If land is leased out',
                '• Court Orders: Any pending legal cases'
            ],
            sample: `SAMPLE 6/12 EXTRACT\n\nSurvey-No: 456/A\nArea: 2.50 Acres\n\nRights: Full Ownership\nRestrictions: None\nMortgage: Not Mortgaged\nLease: Not Leased\nCourt Cases: None Pending\n\nValidity: Current as of 01-Jan-2024`
        }
    };

    const residentialSamples = {
        'Sale_Deed': {
            title: 'Sale Deed / Index 2',
            category: 'Ownership Proof',
            description: 'Primary proof of ownership for residential properties. Index 2 is a registered summary.',
            details: [
                '• Buyer Name: Purchaser of the property',
                '• Seller Name: Original owner',
                '• Property Details: Address and area',
                '• Sale Value: Amount paid',
                '• Registration Number: Unique deed ID'
            ],
            sample: `SAMPLE SALE DEED\n\nProperty Address: Flat 301, Tower A, Green Hill Society\nBuyer: Raj Kumar Singh\nSeller: Sharma & Co.\nSale Price: ₹50,00,000\nBuilt-up Area: 1200 Sq.ft\nRegistration No: MH-2023-456789\nDate: 15-June-2023`
        },
        'NA_Order': {
            title: 'NA Order (Non-Agricultural Order)',
            category: 'Land Conversion',
            description: 'Proves that agricultural land has been officially converted for residential/commercial use.',
            details: [
                '• Original Status: Previously agricultural',
                '• Conversion Date: When approval granted',
                '• New Use: Residential/Commercial',
                '• Approval Authority: Taluka/District office',
                '• Permission Duration: Validity period'
            ],
            sample: `SAMPLE NA ORDER\n\nProperty Location: Near Nashik City\nOriginal Use: Agricultural Land\nConverted Use: Residential\nConversion Order: NA-2020-78945\nApproved By: District Agriculture Officer\nValid Till: 15-June-2030`
        },
        'Share_Certificate': {
            title: 'Share Certificate',
            category: 'Society Ownership',
            description: 'Issued by Cooperative Housing Society. Essential for transfer of flats in housing societies.',
            details: [
                '• Member Number: Unique society member ID',
                '• Share Value: Face value of shares',
                '• Flat Number: Residential unit number',
                '• Building Name: Society building name',
                '• Share Percentage: Ownership percentage'
            ],
            sample: `SAMPLE SHARE CERTIFICATE\n\nGreen Hill Housing Society\nMember No: GHS-2023-564\nFlat No: 301, Tower A\nShare Value: ₹50,000\nNo. of Shares: 100\nIssued Date: 15-June-2023\nSerial No: SHR-2023-89456`
        },
        'NOC_Certificate': {
            title: 'NOC Certificate',
            category: 'No Dues',
            description: 'No Objection Certificate confirming all dues and fees are paid to the society/builder.',
            details: [
                '• Issued By: Housing Society/Builder',
                '• Dues Status: All paid/Outstanding',
                '• Maintenance Fees: Current status',
                '• Property Taxes: Cleared',
                '• Outstanding Amount: Zero/Amount due'
            ],
            sample: `SAMPLE NOC CERTIFICATE\n\nGreen Hill Housing Society\nFlat No: 301, Tower A\nMember: Raj Kumar Singh\nProperty Value: ₹50,00,000\n\nDues Status: CLEARED\nAll Maintenance Fees: PAID\nProperty Taxes: CURRENT\nNo Outstanding Dues\n\nIssued Date: 10-Jan-2024\nValidity: Till Transfer`
        },
        'Property_Tax': {
            title: 'Property Tax Receipt',
            category: 'Tax Payment',
            description: 'Latest property tax paid receipt ensuring all municipal taxes are current.',
            details: [
                '• Assessment Number: Property ID',
                '• Property Value: Assessed value',
                '• Tax Amount: Annual tax due',
                '• Payment Date: When paid',
                '• Receipt Number: Payment ID'
            ],
            sample: `SAMPLE PROPERTY TAX RECEIPT\n\nNMC (Nashik Municipal Corporation)\nAssessment No: PT-2023-45678\nProperty: Flat 301, Tower A\nOwner: Raj Kumar Singh\nTax Year: 2023-2024\nTax Amount: ₹25,000\nPayment Date: 15-Jan-2024\nReceipt No: PMT-2024-89456`
        }
    };

    return (
        <div>
            <Navbar />
            <div style={containerStyle}>
                <div style={headerStyle}>
                    <h1>Documents Required</h1>
                    <p style={{ fontSize: '18px', color: '#666' }}>Check what documents you need for buying or selling property</p>
                </div>

                <div style={tabContainerStyle}>
                    <button
                        style={tabStyle(activeTab === 'Agricultural')}
                        onClick={() => setActiveTab('Agricultural')}
                    >
                        🌾 Agricultural / Land
                    </button>
                    <button
                        style={tabStyle(activeTab === 'Residential')}
                        onClick={() => setActiveTab('Residential')}
                    >
                        🏠 Residential / Non-Agricultural
                    </button>
                </div>

                <div style={contentStyle}>
                    {activeTab === 'Agricultural' ? (
                        <div>
                            <h2 style={sectionTitleStyle}>Agricultural Land Documents</h2>
                            <ul style={{ listStyleType: 'none', padding: 0 }}>
                                <li style={listItemStyle}>
                                    <strong>1. 7/12 Extract (Satbara Utara):</strong>
                                    <p style={{ margin: '5px 0 0 20px', color: '#666' }}>
                                        This is the most important document. It proves ownership and gives details about the land's survey number, area, and owner's name. It is maintained by the Revenue Department.
                                    </p>
                                </li>
                                <li style={listItemStyle}>
                                    <strong>2. 8A Extract:</strong>
                                    <p style={{ margin: '5px 0 0 20px', color: '#666' }}>
                                        This document represents the total holding of the land owner in a particular village. It validates the ownership details mentioned in the 7/12 extract.
                                    </p>
                                </li>
                                <li style={listItemStyle}>
                                    <strong>3. Ferfar (Mutation Entry):</strong>
                                    <p style={{ margin: '5px 0 0 20px', color: '#666' }}>
                                        This document records the transfer of ownership history. It is crucial to check the history of how the land was transferred to the current owner.
                                    </p>
                                </li>
                                <li style={listItemStyle}>
                                    <strong>4. 6/12 Extract (Hakkajapti Patrak):</strong>
                                    <p style={{ margin: '5px 0 0 20px', color: '#666' }}>
                                        This is required in case of disputed lands or lands with specific conditions.
                                    </p>
                                </li>
                            </ul>

                            {/* Sample Documents Section */}
                            <div>
                                <h3 style={{ ...sectionTitleStyle, marginTop: '30px' }}>📋 Sample Documents</h3>
                                <p style={{ color: '#666', marginBottom: '20px' }}>Below are visual samples of the required agricultural documents: (Click any card to view details)</p>
                                <div style={sampleDocumentStyle}>
                                    {[
                                        { key: '7/12_Extract', name: '7/12 Extract', subtitle: 'Satbara', icon: '📄' },
                                        { key: '8A_Extract', name: '8A Extract', subtitle: 'Land Holdings', icon: '📋' },
                                        { key: 'Farfar', name: 'Farfar', subtitle: 'Mutation Entry', icon: '📑' },
                                        { key: '6/12_Extract', name: '6/12 Extract', subtitle: 'Disputes/Rights', icon: '📃' }
                                    ].map(doc => (
                                        <div 
                                            key={doc.key}
                                            style={documentCardStyle}
                                            onClick={() => setSelectedDocument(documentSamples[doc.key])}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-5px)';
                                                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                                            }}
                                        >
                                            <div style={documentImageStyle}>
                                                <div style={{ textAlign: 'center' }}>
                                                    <div style={{ fontSize: '48px', marginBottom: '10px' }}>{doc.icon}</div>
                                                    <div>{doc.name}</div>
                                                </div>
                                            </div>
                                            <div style={documentNameStyle}>
                                                <p style={{ margin: '0', fontWeight: '600', color: '#333' }}>{doc.name}</p>
                                                <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#999' }}>{doc.subtitle}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <h2 style={sectionTitleStyle}>Residential / Non-Agricultural Property</h2>
                            <ul style={{ listStyleType: 'none', padding: 0 }}>
                                <li style={listItemStyle}>
                                    <strong>1. Sale Deed / Index 2:</strong>
                                    <p style={{ margin: '5px 0 0 20px', color: '#666' }}>
                                        The primary proof of ownership. Index 2 is a summary of the registered sale deed.
                                    </p>
                                </li>
                                <li style={listItemStyle}>
                                    <strong>2. NA Order (Non-Agricultural Order):</strong>
                                    <p style={{ margin: '5px 0 0 20px', color: '#666' }}>
                                        Required if the land was originally agricultural but has been converted for residential or commercial use.
                                    </p>
                                </li>
                                <li style={listItemStyle}>
                                    <strong>3. Share Certificate (for Societies):</strong>
                                    <p style={{ margin: '5px 0 0 20px', color: '#666' }}>
                                        Issued by the Cooperative Housing Society to the owner. Essential for transfer of flats.
                                    </p>
                                </li>
                                <li style={listItemStyle}>
                                    <strong>4. NOC from Society / Builder:</strong>
                                    <p style={{ margin: '5px 0 0 20px', color: '#666' }}>
                                        No Objection Certificate is required to ensure there are no dues pending on the property.
                                    </p>
                                </li>
                                <li style={listItemStyle}>
                                    <strong>5. Property Tax Receipt:</strong>
                                    <p style={{ margin: '5px 0 0 20px', color: '#666' }}>
                                        Latest tax paid receipt to ensure all municipal taxes are paid.
                                    </p>
                                </li>
                            </ul>

                            {/* Sample Documents Section */}
                            <div>
                                <h3 style={{ ...sectionTitleStyle, marginTop: '30px' }}>📋 Sample Documents</h3>
                                <p style={{ color: '#666', marginBottom: '20px' }}>Below are visual samples of the required residential property documents: (Click any card to view details)</p>
                                <div style={sampleDocumentStyle}>
                                    {[
                                        { key: 'Sale_Deed', name: 'Sale Deed', subtitle: 'Ownership Proof', icon: '📄' },
                                        { key: 'NA_Order', name: 'NA Order', subtitle: 'Land Conversion', icon: '📋' },
                                        { key: 'Share_Certificate', name: 'Share Certificate', subtitle: 'Society Ownership', icon: '📑' },
                                        { key: 'NOC_Certificate', name: 'NOC Certificate', subtitle: 'No Dues', icon: '📃' },
                                        { key: 'Property_Tax', name: 'Tax Receipt', subtitle: 'Tax Payment', icon: '🧾' }
                                    ].map(doc => (
                                        <div 
                                            key={doc.key}
                                            style={documentCardStyle}
                                            onClick={() => setSelectedDocument(residentialSamples[doc.key])}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-5px)';
                                                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                                            }}
                                        >
                                            <div style={documentImageStyle}>
                                                <div style={{ textAlign: 'center' }}>
                                                    <div style={{ fontSize: '48px', marginBottom: '10px' }}>{doc.icon}</div>
                                                    <div>{doc.name}</div>
                                                </div>
                                            </div>
                                            <div style={documentNameStyle}>
                                                <p style={{ margin: '0', fontWeight: '600', color: '#333' }}>{doc.name}</p>
                                                <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#999' }}>{doc.subtitle}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Document Preview Modal */}
            {selectedDocument && (
                <div style={modalStyle}>
                    <div style={modalContentStyle}>
                        <button 
                            style={closeButtonStyle}
                            onClick={() => setSelectedDocument(null)}
                            title="Close"
                        >
                            ✕
                        </button>
                        <h2 style={{ marginTop: '0', color: '#333' }}>{selectedDocument.title}</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '20px' }}>
                            <div>
                                <h3 style={{ color: '#666', fontWeight: '600', marginTop: '0' }}>Document Information</h3>
                                <p style={{ color: '#999', fontSize: '14px' }}>Category: <strong style={{ color: '#333' }}>{selectedDocument.category}</strong></p>
                                <p style={{ color: '#666', lineHeight: '1.6' }}>{selectedDocument.description}</p>
                                <h4 style={{ color: '#333', marginTop: '15px' }}>Key Details:</h4>
                                <ul style={{ listStyle: 'none', padding: 0, margin: '10px 0' }}>
                                    {selectedDocument.details.map((detail, idx) => (
                                        <li key={idx} style={{ padding: '5px 0', color: '#666' }}>{detail}</li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h3 style={{ color: '#666', fontWeight: '600', marginTop: '0' }}>Sample Document</h3>
                                <div style={{
                                    backgroundColor: '#f5f5f5',
                                    border: '1px solid #ddd',
                                    padding: '20px',
                                    borderRadius: '8px',
                                    fontFamily: 'monospace',
                                    fontSize: '13px',
                                    whiteSpace: 'pre-wrap',
                                    color: '#333',
                                    maxHeight: '400px',
                                    overflowY: 'auto'
                                }}>
                                    {selectedDocument.sample}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentsInfo;
