import React, { useState } from 'react';
import Navbar from './Navbar';

const DocumentsInfo = () => {
    const [activeTab, setActiveTab] = useState('Agricultural');

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

    const documentCardHoverStyle = {
        transform: 'translateY(-5px)',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
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
                                <p style={{ color: '#666', marginBottom: '20px' }}>Below are visual samples of the required agricultural documents:</p>
                                <div style={sampleDocumentStyle}>
                                    <div style={documentCardStyle}>
                                        <div style={documentImageStyle}>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '48px', marginBottom: '10px' }}>📄</div>
                                                <div>7/12 Extract</div>
                                            </div>
                                        </div>
                                        <div style={documentNameStyle}>
                                            <p style={{ margin: '0', fontWeight: '600', color: '#333' }}>7/12 Extract (Satbara)</p>
                                            <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#999' }}>Ownership Proof</p>
                                        </div>
                                    </div>

                                    <div style={documentCardStyle}>
                                        <div style={documentImageStyle}>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '48px', marginBottom: '10px' }}>📄</div>
                                                <div>8A Extract</div>
                                            </div>
                                        </div>
                                        <div style={documentNameStyle}>
                                            <p style={{ margin: '0', fontWeight: '600', color: '#333' }}>8A Extract</p>
                                            <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#999' }}>Land Holding Details</p>
                                        </div>
                                    </div>

                                    <div style={documentCardStyle}>
                                        <div style={documentImageStyle}>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '48px', marginBottom: '10px' }}>📄</div>
                                                <div>Farfar</div>
                                            </div>
                                        </div>
                                        <div style={documentNameStyle}>
                                            <p style={{ margin: '0', fontWeight: '600', color: '#333' }}>Farfar (Mutation)</p>
                                            <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#999' }}>Transfer History</p>
                                        </div>
                                    </div>

                                    <div style={documentCardStyle}>
                                        <div style={documentImageStyle}>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '48px', marginBottom: '10px' }}>📄</div>
                                                <div>6/12 Extract</div>
                                            </div>
                                        </div>
                                        <div style={documentNameStyle}>
                                            <p style={{ margin: '0', fontWeight: '600', color: '#333' }}>6/12 Extract</p>
                                            <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#999' }}>Hakka Japtri Patrak</p>
                                        </div>
                                    </div>
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
                                <p style={{ color: '#666', marginBottom: '20px' }}>Below are visual samples of the required residential property documents:</p>
                                <div style={sampleDocumentStyle}>
                                    <div style={documentCardStyle}>
                                        <div style={documentImageStyle}>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '48px', marginBottom: '10px' }}>📄</div>
                                                <div>Sale Deed</div>
                                            </div>
                                        </div>
                                        <div style={documentNameStyle}>
                                            <p style={{ margin: '0', fontWeight: '600', color: '#333' }}>Sale Deed / Index 2</p>
                                            <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#999' }}>Ownership Proof</p>
                                        </div>
                                    </div>

                                    <div style={documentCardStyle}>
                                        <div style={documentImageStyle}>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '48px', marginBottom: '10px' }}>📄</div>
                                                <div>NA Order</div>
                                            </div>
                                        </div>
                                        <div style={documentNameStyle}>
                                            <p style={{ margin: '0', fontWeight: '600', color: '#333' }}>NA Order</p>
                                            <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#999' }}>Land Conversion</p>
                                        </div>
                                    </div>

                                    <div style={documentCardStyle}>
                                        <div style={documentImageStyle}>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '48px', marginBottom: '10px' }}>📄</div>
                                                <div>Share Certificate</div>
                                            </div>
                                        </div>
                                        <div style={documentNameStyle}>
                                            <p style={{ margin: '0', fontWeight: '600', color: '#333' }}>Share Certificate</p>
                                            <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#999' }}>Society Ownership</p>
                                        </div>
                                    </div>

                                    <div style={documentCardStyle}>
                                        <div style={documentImageStyle}>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '48px', marginBottom: '10px' }}>📄</div>
                                                <div>NOC</div>
                                            </div>
                                        </div>
                                        <div style={documentNameStyle}>
                                            <p style={{ margin: '0', fontWeight: '600', color: '#333' }}>NOC Certificate</p>
                                            <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#999' }}>No Dues</p>
                                        </div>
                                    </div>

                                    <div style={documentCardStyle}>
                                        <div style={documentImageStyle}>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '48px', marginBottom: '10px' }}>📄</div>
                                                <div>Tax Receipt</div>
                                            </div>
                                        </div>
                                        <div style={documentNameStyle}>
                                            <p style={{ margin: '0', fontWeight: '600', color: '#333' }}>Property Tax Receipt</p>
                                            <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#999' }}>Tax Payment</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DocumentsInfo;
