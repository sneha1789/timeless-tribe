import React from 'react';
import './SizeChartModal.css';

const SizeChartModal = ({ productName, sizeChart, onClose }) => {
  const isChartDataValid =
    sizeChart &&
    Array.isArray(sizeChart.headers) &&
    sizeChart.headers.length > 0 &&
    Array.isArray(sizeChart.rows) &&
    sizeChart.rows.length > 0;

  return (
    <div className="modal size-chart-modal-overlay" onClick={onClose}>
      <div
        className="modal-content size-chart-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="close-modal" onClick={onClose}>
          &times;
        </span>
        <h3>Size Chart for {productName}</h3>

        <div className="size-chart-content">
          {isChartDataValid ? (
            <>
              <table>
                <thead>
                  <tr>
                    {sizeChart.headers.map((header, index) => (
                      <th key={index}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sizeChart.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {sizeChart.note && <p className="note">{sizeChart.note}</p>}
            </>
          ) : (
            <div className="no-size-chart-message">
              <p>A size chart is not available for this product.</p>
            </div>
          )}
        </div>
        <button className="cta-button" onClick={onClose}>
          Got It
        </button>
      </div>
    </div>
  );
};

export default SizeChartModal;
