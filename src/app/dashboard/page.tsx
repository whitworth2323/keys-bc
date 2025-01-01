'use client';
import React, { useEffect, useState } from 'react';
import {
  Button,
  Box,
  Typography,
  CircularProgress,
  Snackbar,
  SnackbarCloseReason,
  Alert,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Parser } from '@json2csv/plainjs';
import { useAuthState } from 'react-firebase-hooks/auth';
import ErrorModal from '../_components/Error';
import { useRouter } from 'next/navigation';
import {
  auth,
  logout,
  fetchStats,
  subscribeToStats,
} from '../../../utils/firebase';
//@ts-ignore
import Papa from 'papaparse';
import WarningModal from '../_components/Warning';

type Keys = {
  license_key: string;
  date_created: string;
  license_type: string;
  site_1: string;
  site_1_timestamp: string;
  site_2: string;
  site_2_timestamp: string;
  site_3: string;
  site_3_timestamp: string;
  site_4: string;
  site_4_timestamp: string;
  site_5: string;
  site_5_timestamp: string;
};

function Dashboard() {
  const [user, loading] = useAuthState(auth);

  const [loading1000Keys, setLoading1000Keys] = useState(false);
  const [loading1Key, setLoading1Key] = useState(false);
  const [loadingNumbersReport, setLoadingNumbersReport] = useState(false);
  const [loadingAddKeys, setLoadingAddKeys] = useState(false);
  const [csv, setCSV] = React.useState<File | null>(null);
  const [keysInfo, setKeysInfo] = useState({
    accepted: 0,
    rejected: 0,
  });
  const [openModal, setOpenModal] = useState(false);

  const [successOpen, setSuccessOpen] = useState(false); // For SnackBar
  const [failOpen, setFailOpen] = useState(false); // For SnackBar
  const router = useRouter();
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showWarning, setShowWarning] = useState(false);
  const [userConfirmation, setUserConfirmation] = useState(false);
  const [validKeys, setValidKeys] = useState<string[]>([]);
  const [stats, setStats] = useState({
    totalKeys: 0,
    activeOneOrMore: 0,
    activeTwoOrMore: 0,
    activeThreeOrMore: 0,
    activeFourOrMore: 0,
    activeFive: 0,
  });

  const fetchAndSetStats = async () => {
    const newStats = await fetchStats();
    setStats(newStats);
  };

  const generateButtonStyle = {
    backgroundColor: '#10439F',
    color: 'white',
    ' &:hover': {
      backgroundColor: '#10439F',
    },
    border: '3px solid black',
    borderRadius: '10%',
    fontFamily: 'Roboto',
    '&:disabled': {
      color: 'white', // Maintain the text color
    },
  };
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    } else {
      fetchAndSetStats();
    }
  }, [user, loading, router]);

  useEffect(() => {
    console.log('here');
    if (!csv) return;
    console.log({ csv });
    importCSV();
  }, [csv]);

  useEffect(() => {
    const unsubscribe = subscribeToStats(newStats => {
      setStats(newStats);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function importKeys() {
      try {
        setLoadingAddKeys(true);
        const response = await fetch(`dashboard/api/import-keys`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ keys: validKeys }),
        });

        const data = await response.json();
        const { validatedKeysInfo } = data;

        if (!validatedKeysInfo) {
          throw new Error('Error in importing CSV. Please try again.');
        }

        setKeysInfo(validatedKeysInfo);
        setOpenModal(true);
        setUserConfirmation(false);
      } catch (err) {
        console.error(err);
        openErrorModal('Error in importing CSV. Please try again.');
        setUserConfirmation(false);
      } finally {
        setLoadingAddKeys(false);
      }
    }

    if (userConfirmation) importKeys();
  }, [userConfirmation]);

  const handleClose = (event: any, reason?: SnackbarCloseReason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSuccessOpen(false);
    setFailOpen(false);
  };

  async function genKeys(n: number) {
    if (n === 1000) setLoading1000Keys(true);
    if (n === 1) setLoading1Key(true);

    const parser = new Parser({
      header: false,
    });

    try {
      const res = await fetch(`dashboard/api/generate-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ numKeys: n }),
      });

      // in case of error throw error
      if (!res.ok) throw new Error('Error in Generating Keys');

      const { keys } = await res.json();
      if (keys.length === 0) return;

      console.log({ keys });
      const csv = parser.parse(keys);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'keys.csv';
      a.click();
      setSuccessOpen(true);
    } catch (err) {
      console.error(err);
      openErrorModal('Error in generating keys. Please try again.');
    } finally {
      if (n === 1000) setLoading1000Keys(false);
      if (n === 1) setLoading1Key(false);
    }
  }

  const openErrorModal = (message: string) => {
    setErrorMessage(message);
    setIsErrorOpen(true);
  };

  const closeErrorModal = () => {
    setIsErrorOpen(false);
  };

  function formatDate() {
    const date = new Date();
    let day = date.getDate().toString().padStart(2, '0');
    let month = (date.getMonth() + 1).toString().padStart(2, '0');
    let year = date.getFullYear().toString().slice(2);

    return `${month}-${day}-${year}`;
  }

  async function genReport() {
    setLoadingNumbersReport(true);

    const parser = new Parser({
      header: true,
    });

    try {
      const res = await fetch(`dashboard/api/generate-report`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) throw new Error('Error in Generating Report');

      const { csv } = await res.json();
      const keyDocs = csv;
      if (keyDocs.length === 0) return;

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const formattedDate = formatDate();
      a.download = `BugwanaKeyServer_NumbersReport_${formattedDate}.csv`;
      a.click();
    } catch (err) {
      console.error(err);
      openErrorModal('Error in generating report. Please try again.');
    } finally {
      setLoadingNumbersReport(false);
    }
  }

  async function importCSV() {
    if (!csv) return;
    const reader = new FileReader();

    try {
      reader.onload = async function (file) {
        try {
          setLoadingAddKeys(true);

          if (!file.target) return;

          const importedCSV = Papa.parse(file.target.result as string, {
            header: true,
          });

          const csvData = importedCSV.data;
          console.log({ csvData });
          if (csvData.length === 0) {
            openErrorModal(
              'The CSV file is empty or Format is incorrect. Please check the file.',
            );
            return;
          }

          // * License Key column is mandatory
          const csvColumns = Object.keys(csvData[0]);
          if (!csvColumns.includes('License Key')) {
            console.error('Invalid CSV');
            openErrorModal(
              'The CSV file is invalid. Please check the file and try again.',
            );
            return;
          }

          // * Creating the Key Objects that will be sent to the API
          const allKeys = csvData.map((key: any) => {
            return {
              license_key: key['License Key'] || '',
              date_created: key['Date Created'] || '',
              license_type: key['License Type'] || 'App_Sumo_5_site',
              site_1: key['Site 1'] || '',
              site_1_timestamp: key['Site 1 Timestamp'] || '',
              site_2: key['Site 2'] || '',
              site_2_timestamp: key['Site 2 Timestamp'] || '',
              site_3: key['Site 3'] || '',
              site_3_timestamp: key['Site 3 Timestamp'] || '',
              site_4: key['Site 4'] || '',
              site_4_timestamp: key['Site 4 Timestamp'] || '',
              site_5: key['Site 5'] || '',
              site_5_timestamp: key['Site 5 Timestamp'] || '',
            };
          });

          // *  Remove empty keys
          const filteredKeys = allKeys.filter(
            (key: any) => key.license_key !== '',
          );

          setValidKeys(filteredKeys);
          setShowWarning(true);
        } catch {
          console.log('Error in importCSV');
        } finally {
          setLoadingAddKeys(false);
        }
      };
      reader.readAsText(csv);
    } catch (err) {
      console.error(err);
      openErrorModal('Error in importing CSV. Please try again.');
    }
  }

  return (
    <>
      <Typography
        variant='h4'
        sx={{
          textAlign: 'center',
          marginTop: '20px',
          fontFamily: 'Roboto',
        }}
      >
        Dashboard
      </Typography>
      <Box
        sx={{
          border: '1px solid black',
          borderRadius: '10%',
          marginX: '30%',
          marginTop: '5%',
          display: 'flex',
          flexDirection: 'column',
          padding: '5%',
          gap: '20px',
        }}
      >
        <Typography
          variant='h6'
          sx={{
            textAlign: 'center',
            fontFamily: 'Roboto',

            textDecoration: 'underline',
          }}
        >
          App Sumo 5 Site Key Generator
        </Typography>
        <StatsComponent stats={stats} fetchAndSetStats={fetchAndSetStats} />
        <LoadingButton
          sx={generateButtonStyle}
          loadingPosition='start'
          loading={loading1000Keys}
          loadingIndicator={<CircularProgress size={20} color='inherit' />}
          onClick={() => genKeys(1000)}
        >
          Generate 1000 Key App Sumo .csv
        </LoadingButton>
        <LoadingButton
          sx={generateButtonStyle}
          loadingPosition='start'
          loading={loading1Key}
          loadingIndicator={<CircularProgress size={20} color='inherit' />}
          onClick={() => genKeys(1)}
        >
          Generate 1 Key App Sumo .csv
        </LoadingButton>
        <LoadingButton
          sx={generateButtonStyle}
          loadingPosition='start'
          loading={loadingNumbersReport}
          loadingIndicator={<CircularProgress size={20} color='inherit' />}
          onClick={genReport}
        >
          Generate Numbers Report
        </LoadingButton>
        <LoadingButton
          sx={generateButtonStyle}
          loadingPosition='start'
          loading={loadingAddKeys}
          loadingIndicator={<CircularProgress size={20} color='inherit' />}
          // onClick={importCSV}
          style={{
            cursor: 'pointer',
          }}
        >
          <Box
            key={Math.random()}
            component='input'
            type='file'
            sx={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
              opacity: 0,
              cursor: 'pointer',
            }}
            accept='.csv'
            onChange={e => {
              e.preventDefault();

              if (e.target.files) {
                const file = e.target.files[0];
                setCSV(file);
              }
            }}
          />
          Import Keys From Numbers Report
        </LoadingButton>
        <Button
          sx={{
            backgroundColor: '#C65BCF',
            color: 'white',
            ' &:hover': {
              backgroundColor: '#C65BCF',
            },
            border: '3px solid black',
            borderRadius: '10%',
            fontFamily: 'Roboto',
          }}
          onClick={logout}
        >
          Logout
        </Button>
      </Box>
      <Snackbar
        open={successOpen}
        autoHideDuration={1000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity='success' sx={{ width: '100%' }}>
          Success! Your file is downloading.
        </Alert>
      </Snackbar>
      <Snackbar open={failOpen} autoHideDuration={1000} onClose={handleClose}>
        <Alert onClose={handleClose} severity='error' sx={{ width: '100%' }}>
          Sorry an error occured. Please try again later.
        </Alert>
      </Snackbar>
      {
        // Modal to show how many keys were inserted and how many were rejected
        openModal && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 100,
            }}
            onClick={() => setOpenModal(false)}
          >
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: 'white',
                padding: '2%',
                borderRadius: '10px',
                width: '30%',
              }}
            >
              <Typography
                variant='h5'
                sx={{
                  fontFamily: 'Roboto',
                  textAlign: 'center',
                  marginTop: '5%',
                  fontWeight: 'bold',
                }}
              >
                Key Import Info
              </Typography>
              <Typography
                variant='body1'
                sx={{
                  textAlign: 'center',
                  fontFamily: 'Roboto',
                }}
              >
                Keys Accepted: {keysInfo.accepted}
              </Typography>
              <Typography
                variant='body1'
                sx={{
                  textAlign: 'center',
                  fontFamily: 'Roboto',
                }}
              >
                Keys Rejected: {keysInfo.rejected}
              </Typography>
              <Button
                onClick={() => setOpenModal(false)}
                variant='contained'
                color='primary'
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  margin: 'auto',
                  marginTop: '5%',
                  backgroundColor: '#C65BCF',
                  color: 'white',
                  ' &:hover': {
                    backgroundColor: '#C65BCF',
                  },
                  borderRadius: '10px',
                }}
              >
                Close
              </Button>
            </Box>
          </Box>
        )
      }
      <ErrorModal
        open={isErrorOpen}
        onClose={closeErrorModal}
        errorMessage={errorMessage}
      />

      <WarningModal
        open={showWarning}
        onConfirmation={() => {
          setUserConfirmation(prev => !prev);
          setShowWarning(prev => !prev);
        }}
        onClose={() => setShowWarning(prev => !prev)}
        warningMessage='DANGER: Importing this file overrides the entire Firebase key database with the new file. If the import is successful, all previous key information, site activations, etc. are lost. Do you wish to proceed?'
      />
    </>
  );
}

const StatsComponent = ({ stats, fetchAndSetStats }: any) => {
  return (
    // <Box sx={{ display: 'flex', justifyContent: 'center' }}>
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Box
        sx={{
          borderRight: '5px solid black',
          padding: '0 10px',
        }}
      >
        <Box>
          <Typography variant='h6'>S</Typography>
          <Typography variant='h6'>T</Typography>
          <Typography variant='h6'>A</Typography>
          <Typography variant='h6'>T</Typography>
          <Typography variant='h6'>S</Typography>
        </Box>
      </Box>
      <Box sx={{ textAlign: 'center', marginLeft: 2 }}>
        <Typography
          variant='body1'
          sx={{ fontSize: '0.8rem', textDecoration: 'underline' }}
        >
          TOTAL KEYS:
        </Typography>
        <Typography>{stats.totalKeys}</Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '.2rem',
          textAlign: 'center',
          marginLeft: 2,
        }}
      >
        <Typography
          variant='body1'
          sx={{
            fontSize: '0.8rem',
            textDecoration: 'underline',
          }}
        >
          ACTIVE ON
        </Typography>
        <Typography variant='body1' sx={{ fontSize: '0.8rem' }}>
          ONE OR MORE SITES: {stats.activeOneOrMore}
        </Typography>
        <Typography variant='body1' sx={{ fontSize: '0.8rem' }}>
          TWO OR MORE SITES: {stats.activeTwoOrMore}
        </Typography>
        <Typography variant='body1' sx={{ fontSize: '0.8rem' }}>
          THREE OR MORE SITES: {stats.activeThreeOrMore}
        </Typography>
        <Typography variant='body1' sx={{ fontSize: '0.8rem' }}>
          FOUR OR MORE SITES: {stats.activeFourOrMore}
        </Typography>
        <Typography variant='body1' sx={{ fontSize: '0.8rem' }}>
          FIVE SITES: {stats.activeFive}
        </Typography>
      </Box>
      <Box sx={{ textAlign: 'center', marginLeft: 2 }}>
        <Button
          sx={{
            textAlign: 'center',
            backgroundColor: '#10439F',
            color: '#ffffff',
            ' &:hover': {
              backgroundColor: '#10439F',
            },
            border: '3px solid black',
            borderRadius: '10%',
            fontFamily: 'Roboto',
          }}
          onClick={fetchAndSetStats}
        >
          REFRESH
        </Button>
      </Box>
    </Box>
    // </Box>
  );
};

export default Dashboard;
