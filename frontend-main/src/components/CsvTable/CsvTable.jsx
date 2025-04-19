import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Box,
  CircularProgress
} from '@mui/material';
import { getCsvData } from '../../services/api';

const CSVTable = ({ tempdir }) => {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!tempdir) return;
      
      try {
        setLoading(true);
        setError(null);
        const response = await getCsvData(tempdir);
        setHeaders(response.headers);
        setData(response.data);
      } catch (error) {
        console.error('Error fetching CSV data:', error);
        setError('Ошибка при загрузке данных');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tempdir]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, color: 'error.main', textAlign: 'center' }}>
        {error}
      </Box>
    );
  }

  return (
    <Box sx={{ 
      width: '100%', 
      mt: 2,
      maxHeight: '400px',
      overflow: 'auto'
    }}>
      <TableContainer component={Paper}>
        <Table 
          sx={{ 
            minWidth: 650,
            '& thead th': {
              position: 'sticky',
              top: 0,
              backgroundColor: '#f5f5f5',
              zIndex: 1
            }
          }} 
          aria-label="csv table"
        >
          <TableHead>
            <TableRow>
              {headers.map((header, index) => (
                <TableCell key={index} align="center">
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {headers.map((header, cellIndex) => (
                  <TableCell key={cellIndex} align="center">
                    {row[header]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default CSVTable;
