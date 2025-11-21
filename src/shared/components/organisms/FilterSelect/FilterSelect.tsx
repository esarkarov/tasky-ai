import { ProjectListItem } from '@/features/projects/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { ClipboardCheck, Hash, Inbox } from 'lucide-react';

interface FilterSelectProps {
  value: string | null;
  projects: ProjectListItem[];
  handleValueChange: (value: string | null) => void;
}

export const FilterSelect = ({ value, projects, handleValueChange }: FilterSelectProps) => {
  const onValueChange = (selectedValue: string) => {
    handleValueChange(selectedValue === 'all' ? null : selectedValue);
  };

  return (
    <Select
      value={value || 'all'}
      onValueChange={onValueChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="All Projects" />
      </SelectTrigger>
      <SelectContent className="w-[200px]">
        <SelectItem value="all">
          <div className="flex items-center gap-2">
            <ClipboardCheck
              size={14}
              className="text-muted-foreground"
            />
            <span>All Projects</span>
          </div>
        </SelectItem>
        <SelectItem value="inbox">
          <div className="flex items-center gap-2">
            <Inbox
              size={14}
              className="text-muted-foreground"
            />
            <span>Inbox</span>
          </div>
        </SelectItem>
        {projects.map((project) => (
          <SelectItem
            key={project.$id}
            value={project.$id}>
            <div className="flex items-center gap-2">
              <Hash
                size={14}
                style={{ color: project.color_hex }}
              />
              <span>{project.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
