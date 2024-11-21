import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useToast } from '@chakra-ui/react';
import { fetchObjectDetails } from 'src/api'; // Adjust import paths as needed
import { ObjectDetail, ObjectTypeValue } from 'src/types/Object';
import { Fact, Task, TaskStatus } from 'src/types';

interface ObjectDetailContextProps {
  object: ObjectDetail | null;
  facts: Fact[];
  tasks: Task[];
  imgUrls: string[];
  isLoading: boolean;
  tabIndex: number;
  setTabIndex: (index: number) => void;
  refresh: () => void;
  setIsLoading: (isLoading: boolean) => void;
}

const ObjectDetailContext = createContext<ObjectDetailContextProps | undefined>(
  undefined
);

export const ObjectDetailProvider: React.FC<{
  objectId: string;
  children: React.ReactNode;
}> = ({ objectId, children }) => {
  const [object, setObject] = useState<ObjectDetail | null>(null);
  const [facts, setFacts] = useState<Fact[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [imgUrls, setImgUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [forceUpdate, setForceUpdate] = useState(0);
  const toast = useToast();

  const loadImageUrlsFromObject = useCallback((obj: ObjectDetail) => {
    const tmp: string[] = [];
    obj?.typeValues.forEach((otv: ObjectTypeValue) => {
      Object.entries(otv.type_values).forEach(([_, value]) => {
        if (
          value &&
          typeof value === 'string' &&
          (value.includes('http://') ||
            value.includes('https://') ||
            value.includes('data:image'))
        ) {
          tmp.push(value);
        }
      });
    });
    return tmp;
  }, []);

  useEffect(() => {
    const loadObjectDetails = async () => {
      try {
        setIsLoading(true);
        const details = await fetchObjectDetails(objectId);
        setObject(details);
        setFacts(details.facts);
        setTasks(details.tasks.filter((task: Task) => task.deletedAt === null));
        setImgUrls(loadImageUrlsFromObject(details));
        if (
          details.tasks.filter(
            (task: any) => task.status !== TaskStatus.COMPLETED
          ).length > 0
        ) {
          setTabIndex(0);
        }
      } catch (error) {
        console.error(error);
        toast({
          title: 'Error loading object details',
          description: 'Please try again later.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadObjectDetails();
  }, [objectId, toast, forceUpdate, loadImageUrlsFromObject]);

  return (
    <ObjectDetailContext.Provider
      value={{
        object,
        facts,
        tasks,
        imgUrls,
        isLoading,
        tabIndex,
        setTabIndex,
        refresh: () => {
          setForceUpdate(forceUpdate + 1);
        },
        setIsLoading,
      }}
    >
      {children}
    </ObjectDetailContext.Provider>
  );
};

export const useObjectDetail = () => {
  const context = useContext(ObjectDetailContext);
  if (!context) {
    throw new Error(
      'useObjectDetail must be used within an ObjectDetailProvider'
    );
  }
  return context;
};
