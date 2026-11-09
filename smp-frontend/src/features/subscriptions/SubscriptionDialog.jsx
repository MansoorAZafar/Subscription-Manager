import { Button, IconButton, MenuItem, TextField } from "@mui/material";
import { Close } from "@mui/icons-material";
import { useSmp } from "../../app/SmpProvider.jsx";

export default function SubscriptionDialog() {
  const { editor, setEditor, saveSubscription } = useSmp();
  if (!editor) return null;
  const save = (event) => {
    event.preventDefault();
    saveSubscription(Object.fromEntries(new FormData(event.currentTarget)));
  };
  return (
    <div className="modal-backdrop" onClick={() => setEditor(null)}>
      <form
        className="modal"
        onSubmit={save}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-title">
          <div>
            <h2>{editor.id ? "Edit subscription" : "Add subscription"}</h2>
            <p>Keep your recurring payments organized.</p>
          </div>
          <IconButton
            type="button"
            onClick={() => setEditor(null)}
            aria-label="Close"
          >
            <Close />
          </IconButton>
        </div>
        <TextField
          label="Service name"
          name="name"
          defaultValue={editor.name}
          required
          fullWidth
        />
        <TextField
          label="Plan"
          name="plan"
          defaultValue={editor.plan}
          fullWidth
        />
        <div className="form-row">
          <TextField
            label="Price"
            name="price"
            type="number"
            inputProps={{ min: 0, step: "0.01" }}
            defaultValue={editor.price}
            required
          />
          <TextField
            label="Billing cycle"
            name="cycle"
            select
            defaultValue={editor.cycle}
          >
            <MenuItem value="Monthly">Monthly</MenuItem>
            <MenuItem value="Yearly">Yearly</MenuItem>
          </TextField>
        </div>
        <div className="form-row">
          <TextField
            label="Category"
            name="category"
            select
            defaultValue={editor.category}
          >
            {[
              "Entertainment",
              "Software",
              "Productivity",
              "Utilities",
              "Memberships",
              "Other",
            ].map((category) => (
              <MenuItem value={category} key={category}>
                {category}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Next payment"
            name="date"
            type="date"
            defaultValue={editor.date}
            InputLabelProps={{ shrink: true }}
            required
          />
        </div>
        <div className="modal-actions">
          <Button type="button" onClick={() => setEditor(null)}>
            Cancel
          </Button>
          <Button type="submit" variant="contained">
            Save subscription
          </Button>
        </div>
      </form>
    </div>
  );
}
