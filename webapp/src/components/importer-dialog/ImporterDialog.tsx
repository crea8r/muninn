import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  useToast,
  Tabs,
  Tab,
  TabPanel,
  TabList,
  TabPanels,
} from '@chakra-ui/react';
import { ObjectType } from '../../types/Object';
import { listObjectTypes } from '../../api/objType';
import {
  getImportHistory,
  getImportTaskStatus,
  ImportTask,
  initiateImport,
} from 'src/api/import';
import LoadingPanel from '../LoadingPanel';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { FactToCreate } from 'src/api/fact';
import { Step1, Step3, StepController, StepNavigation } from './Steps';
import Step2 from './Step2';
import Step4 from './Step4';
import { ImportHistory, ImportingNotification } from './ImportHistory';

interface ImporterDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const ImporterDialog: React.FC<ImporterDialogProps> = ({ isOpen, onClose }) => {
  dayjs.extend(relativeTime);
  const [objectTypes, setObjectTypes] = useState<ObjectType[]>([]);
  const [objectTypeInput, setObjectTypeInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [selectedObjectType, setSelectedObjectType] =
    useState<ObjectType | null>(null);
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
  const [idStringColumn, setIdStringColumn] = useState<string>('');
  const [nameColumn, setNameColumn] = useState<string>('');
  const [importTaskId, setImportTaskId] = useState<string | null>(null);
  const [currentImportTask, setCurrentImportTask] = useState<ImportTask | null>(
    null
  );
  const [importHistory, setImportHistory] = useState<ImportTask[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [defaultFact, setDefaultFact] = useState<FactToCreate>({
    text: '',
    happenedAt: dayjs().toISOString(),
    location: '',
    objectIds: [],
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const toast = useToast();

  const fetchImportHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getImportHistory(currentPage, pageSize);
      setImportHistory(response.tasks || []);
      setTotalPages(Math.ceil(response.total_count / response.page_size));
      const ongoingTask = (response.tasks || []).find(
        (task) => task.status === 'pending' || task.status === 'processing'
      );
      if (ongoingTask) {
        setImportTaskId(ongoingTask.id);
        setCurrentImportTask(ongoingTask);
      }
    } catch (error) {
      console.error('Error fetching import history:', error);
      toast({
        title: 'Error fetching import history',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, toast]);

  useEffect(() => {
    if (isOpen) {
      fetchImportHistory();
    }
  }, [isOpen, fetchImportHistory]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (importTaskId) {
      intervalId = setInterval(async () => {
        try {
          const status = await getImportTaskStatus(importTaskId);
          setCurrentImportTask(status);

          if (status.status === 'completed' || status.status === 'failed') {
            clearInterval(intervalId);
            toast({
              title: `Import ${status.status}`,
              description:
                status.status === 'completed'
                  ? 'Your data has been successfully imported.'
                  : `There was an error importing your data: ${status.error_message}`,
              status: status.status === 'completed' ? 'success' : 'error',
              duration: 5000,
              isClosable: true,
            });
            fetchImportHistory();
          }
        } catch (error) {
          console.error('Error fetching import status:', error);
        }
      }, 60000); // Check every minute
    }
    return () => clearInterval(intervalId);
  }, [importTaskId, toast, fetchImportHistory]);

  useEffect(() => {
    const fetchObjectTypes = async () => {
      try {
        setIsLoading(true);
        const response = await listObjectTypes({ page: 1, pageSize: 100 });
        setObjectTypes(response.objectTypes);
      } catch (error) {
        console.error('Error fetching object types:', error);
        toast({
          title: 'Error fetching object types',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchObjectTypes();
  }, [toast]);

  const handleFileChange = (data: string[][]) => {
    setCsvData(data);
  };

  const handleObjectTypeSelect = (objectType: ObjectType) => {
    setSelectedObjectType(objectType);
    setObjectTypeInput('');
  };

  const buildFact = useCallback(
    (row: string[]) => {
      let rs: FactToCreate = { ...defaultFact };
      if (!rs.text.includes('{{')) {
        return rs;
      } else {
        const columns = csvData[0];
        const matchedColumns = columns.filter((c) =>
          rs.text.includes(`{{${c}}`)
        );
        if (matchedColumns.length > 0) {
          matchedColumns.forEach((column) => {
            rs.text = rs.text.replace(
              `{{${column}}}`,
              row[columns.indexOf(column)]
            );
          });
        }
      }
      return rs;
    },
    [csvData, defaultFact]
  );

  const handleImport = async () => {
    if (
      !selectedObjectType ||
      csvData.length === 0 ||
      !idStringColumn ||
      !defaultFact
    ) {
      toast({
        title: 'Invalid import data',
        description: 'Please ensure all steps are completed correctly.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const importData = {
      obj_type_id: selectedObjectType.id,
      file_name: fileName,
      rows: csvData.slice(1).map((row) => {
        const idStringIndex = csvData[0].indexOf(idStringColumn);
        const nameIndex = csvData[0].indexOf(nameColumn);
        const values: { [key: string]: string } = {};
        Object.entries(fieldMapping).forEach(([field, column]) => {
          const columnIndex = csvData[0].indexOf(column);
          if (columnIndex !== -1) {
            values[field] = row[columnIndex];
          }
        });
        return {
          id_string: row[idStringIndex],
          name: row[nameIndex] || row[idStringIndex],
          values: values,
          fact: buildFact(row),
        };
      }),
      tags: selectedTags,
    };
    try {
      setIsLoading(true);
      const taskId = await initiateImport(importData);
      setImportTaskId(taskId);
      toast({
        title: 'Import started',
        description: 'Your data import has been initiated.',
        status: 'info',
        duration: 5000,
        isClosable: true,
      });
      await fetchImportHistory();
    } catch (error) {
      console.error('Error starting import:', error);
      toast({
        title: 'Import error',
        description:
          'There was an error starting the import. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
      handleReset();
    }
    onClose();
  };

  const handleReset = () => {
    setStep(1);
    setSelectedObjectType(null);
    setObjectTypeInput('');
    setCsvData([]);
    setFileName('');
    setFieldMapping({});
    setIdStringColumn('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        handleReset();
      }}
      size='xl'
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {currentImportTask &&
          (currentImportTask.status === 'pending' ||
            currentImportTask.status === 'processing')
            ? 'Import In Progress'
            : `Import CSV`}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {isLoading ? (
            <LoadingPanel />
          ) : currentImportTask &&
            (currentImportTask.status === 'pending' ||
              currentImportTask.status === 'processing') ? (
            <ImportingNotification currentImportTask={currentImportTask} />
          ) : (
            <>
              <Tabs>
                <TabList>
                  <Tab>Import History</Tab>
                  <Tab>Import Data</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    <ImportHistory
                      importHistory={importHistory}
                      currentPage={currentPage}
                      setCurrentPage={setCurrentPage}
                      totalPages={totalPages}
                      pageSize={pageSize}
                      setPageSize={setPageSize}
                    />
                  </TabPanel>
                  <TabPanel>
                    <VStack align='stretch'>
                      <StepNavigation
                        step={step}
                        setStep={setStep}
                        handleImport={handleImport}
                        selectedObjectType={selectedObjectType}
                        csvData={csvData}
                        fieldMapping={fieldMapping}
                        idStringColumn={idStringColumn}
                      />
                      {step === 1 && (
                        <Step1
                          objectTypeInput={objectTypeInput}
                          setObjectTypeInput={setObjectTypeInput}
                          objectTypes={objectTypes}
                          selectedObjectType={selectedObjectType}
                          handleObjectTypeSelect={handleObjectTypeSelect}
                        />
                      )}
                      {step === 2 && (
                        <Step2
                          handleFileChange={handleFileChange}
                          fileInputRef={fileInputRef}
                          fileName={fileName}
                          csvData={csvData}
                        />
                      )}
                      {step === 3 && (
                        <Step3
                          csvData={csvData}
                          fieldMapping={fieldMapping}
                          setFieldMapping={setFieldMapping}
                          idStringColumn={idStringColumn}
                          setIdStringColumn={setIdStringColumn}
                          selectedObjectType={selectedObjectType}
                          nameColumn={nameColumn}
                          setNameColumn={setNameColumn}
                        />
                      )}
                      {step === 4 && (
                        <Step4
                          setDefaultFact={setDefaultFact}
                          setSelectedTags={setSelectedTags}
                          selectedTags={selectedTags}
                          columns={csvData[0] || []}
                          defaultFact={defaultFact}
                        />
                      )}
                      {!currentImportTask && (
                        <StepController
                          step={step}
                          setStep={setStep}
                          handleImport={handleImport}
                          selectedObjectType={selectedObjectType}
                          csvData={csvData}
                          fieldMapping={fieldMapping}
                          idStringColumn={idStringColumn}
                        />
                      )}
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ImporterDialog;
